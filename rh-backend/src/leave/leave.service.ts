// src/leave/leave.service.ts

import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
// FIX: Added 'LeaveStatus' to the import list
import { ApproverType, Prisma, Role, User, UserStatus, LeaveStatus } from '@prisma/client';
import { NotificationService } from 'src/notifications/notification.service';
import { UpdateLeaveActionDto } from './dto/update-leave-action.dto';

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private async _calculateLeaveBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        leaveRequests: { where: { overallStatus: 'ACCEPTED' } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found to calculate balance.');
    }

    let workDays = 0;
    let currentDate = new Date(user.joinDate);
    const today = new Date();

    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { workDays++; }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalEarnedLeave = Math.floor(workDays / 10);
    const daysTaken = user.leaveRequests.reduce((acc, req) => {
      const duration = (req.toDate.getTime() - req.fromDate.getTime()) / (1000 * 3600 * 24) + 1;
      return acc + Math.round(duration);
    }, 0);

    const availableBalance = totalEarnedLeave - daysTaken;
    return { totalEarnedLeave, daysTaken, availableBalance };
  }

  async create(createDto: CreateLeaveRequestDto, userId: string) {
    const balance = await this._calculateLeaveBalance(userId);
    const requestedDuration = (new Date(createDto.toDate).getTime() - new Date(createDto.fromDate).getTime()) / (1000 * 3600 * 24) + 1;

    if (requestedDuration <= 0) throw new BadRequestException('The end date must be after the start date.');
    if (balance.availableBalance < requestedDuration) throw new BadRequestException(`Insufficient leave balance. You have ${balance.availableBalance} days remaining, but this request is for ${requestedDuration} days.`);

    const requester = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!requester) throw new NotFoundException('Requester not found.');

    let approvalChainConfig: { step: number; approverType: ApproverType; approverId?: string | null }[] = [];
    let initialApproverId: string | null = null;
    let initialNotificationTarget: { type: 'user' | 'department'; id: string } | null = null;

    switch (requester.role) {
      case Role.EMPLOYEE:
        if (!requester.teamLeaderId || !requester.managerId) throw new BadRequestException('Your Team Leader or Manager is not assigned. Please contact HR.');
        initialApproverId = requester.teamLeaderId;
        initialNotificationTarget = { type: 'user', id: requester.teamLeaderId };
        approvalChainConfig = [
          { step: 1, approverType: ApproverType.TEAM_LEADER, approverId: requester.teamLeaderId },
          { step: 2, approverType: ApproverType.MANAGER, approverId: requester.managerId },
          { step: 3, approverType: ApproverType.HR }, { step: 4, approverType: ApproverType.DHR },
        ];
        break;
      case Role.TEAM_LEADER:
        if (!requester.managerId) throw new BadRequestException('Your Manager is not assigned. Please contact HR.');
        initialApproverId = requester.managerId;
        initialNotificationTarget = { type: 'user', id: requester.managerId };
        approvalChainConfig = [
          { step: 1, approverType: ApproverType.MANAGER, approverId: requester.managerId },
          { step: 2, approverType: ApproverType.HR }, { step: 3, approverType: ApproverType.DHR },
        ];
        break;
      case Role.MANAGER:
        initialApproverId = null;
        initialNotificationTarget = { type: 'department', id: 'HR' };
        approvalChainConfig = [{ step: 1, approverType: ApproverType.HR }, { step: 2, approverType: ApproverType.DHR }];
        break;
      case Role.HR:
        initialApproverId = null;
        approvalChainConfig = [{ step: 1, approverType: ApproverType.DHR }];
        break;
      case Role.DHR:
        initialApproverId = requester.id;
        approvalChainConfig = [{ step: 1, approverType: ApproverType.DHR, approverId: requester.id }];
        break;
      default:
        throw new BadRequestException('Invalid user role for creating leave requests.');
    }

    return this.prisma.$transaction(async (tx) => {
      const leaveRequest = await tx.leaveRequest.create({ data: { fromDate: new Date(createDto.fromDate), toDate: new Date(createDto.toDate), reason: createDto.reason, userId: requester.id, currentApproverId: initialApproverId, }});
      await tx.leaveApproval.createMany({ data: approvalChainConfig.map(chainStep => ({ leaveRequestId: leaveRequest.id, step: chainStep.step, approverType: chainStep.approverType, approverId: chainStep.approverId, }))});
      if (initialNotificationTarget) {
        const notificationMessage = `A new leave request from ${requester.name} ${requester.familyName} requires your action.`;
        if (initialNotificationTarget.type === 'user') {
          await this.notificationService.createForUser(initialNotificationTarget.id, notificationMessage);
        } else if (initialNotificationTarget.type === 'department') {
          await this.notificationService.createForDepartment(initialNotificationTarget.id, notificationMessage);
        }
      }
      return leaveRequest;
    });
  }

  async processApprovalAction(leaveRequestId: string, actingUserId: string, actionDto: UpdateLeaveActionDto) {
    const { status, comment } = actionDto;
    const leaveRequest = await this.prisma.leaveRequest.findUnique({ where: { id: leaveRequestId }, include: { approvals: { orderBy: { step: 'asc' } }, user: true }});
    if (!leaveRequest) throw new NotFoundException('Leave request not found.');
    if (leaveRequest.overallStatus !== LeaveStatus.PENDING) throw new BadRequestException('This leave request has already been finalized.');
    const currentApprovalStep = leaveRequest.approvals.find(a => a.status === LeaveStatus.PENDING);
    if (!currentApprovalStep) throw new BadRequestException('No pending approval step found for this request.');
    const actingUser = await this.prisma.user.findUnique({ where: { id: actingUserId }, include: { department: true } });
    if (!actingUser) throw new UnauthorizedException('Acting user not found.');

    const isUserAuthorized =
      leaveRequest.currentApproverId === actingUserId ||
      (currentApprovalStep.approverType === ApproverType.HR && actingUser.department.name === 'HR') ||
      (currentApprovalStep.approverType === ApproverType.DHR && actingUser.role === Role.DHR);

    if (!isUserAuthorized) throw new UnauthorizedException('You are not authorized to act on this leave request.');
    
    if (status === LeaveStatus.DECLINED) {
      await this.prisma.leaveRequest.update({ where: { id: leaveRequestId }, data: { overallStatus: LeaveStatus.DECLINED, currentApproverId: null } });
      await this.prisma.leaveApproval.update({ where: { id: currentApprovalStep.id }, data: { status: LeaveStatus.DECLINED, comment, approverId: actingUserId } });
      await this.notificationService.createForUser(leaveRequest.userId, `Your leave request was declined. Reason: ${comment || 'No reason provided.'}`);
      return { message: 'Leave request declined.' };
    }
    await this.prisma.leaveApproval.update({ where: { id: currentApprovalStep.id }, data: { status: LeaveStatus.ACCEPTED, approverId: actingUserId } });
    const nextStep = leaveRequest.approvals.find(a => a.step === currentApprovalStep.step + 1);
    if (!nextStep) {
      await this.prisma.leaveRequest.update({ where: { id: leaveRequestId }, data: { overallStatus: LeaveStatus.ACCEPTED, currentApproverId: null } });
      await this.notificationService.createForUser(leaveRequest.userId, 'Congratulations! Your leave request has been fully approved.');
      return { message: 'Leave request has been fully approved.' };
    }
    let nextApproverId: string | null = nextStep.approverId;
    const notificationMessage = `A new leave request from ${leaveRequest.user.name} ${leaveRequest.user.familyName} requires your approval.`;
    if (nextStep.approverType === ApproverType.HR) {
      nextApproverId = null;
      await this.notificationService.createForDepartment('HR', `A leave request from ${leaveRequest.user.name} is ready for HR review.`);
    } else if (nextStep.approverType === ApproverType.DHR) {
      nextApproverId = null;
    } else if (nextApproverId) {
      await this.notificationService.createForUser(nextApproverId, notificationMessage);
    }
    await this.prisma.leaveRequest.update({ where: { id: leaveRequestId }, data: { currentApproverId: nextApproverId } });
    return { message: 'Leave request approved and forwarded to the next step.' };
  }
  
  public async getLeaveBalance(userId: string) { return this._calculateLeaveBalance(userId); }
  async findAllForUser(userId: string) { return this.prisma.leaveRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { approvals: { include: { approver: { select: { name: true, familyName: true }}}, orderBy: { step: 'asc' }}},}); }

  async findPendingForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { department: true } });
    if (!user) throw new NotFoundException('User not found.');
    const orConditions: Prisma.LeaveRequestWhereInput[] = [];
    orConditions.push({ currentApproverId: userId });
    if (user.department.name === 'HR') {
      orConditions.push({ currentApproverId: null, approvals: { some: { status: LeaveStatus.PENDING, approverType: ApproverType.HR } } });
    }
    if (user.role === Role.DHR) {
      orConditions.push({ currentApproverId: null, approvals: { some: { status: LeaveStatus.PENDING, approverType: ApproverType.DHR } } });
    }
    return this.prisma.leaveRequest.findMany({
      where: { overallStatus: LeaveStatus.PENDING, OR: orConditions },
      include: { user: { select: { name: true, familyName: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}