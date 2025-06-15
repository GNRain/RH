import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { Department } from '@prisma/client';
import { NotificationService } from 'src/notifications/notification.service';

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService // --- INJECT SERVICE
  ) {}

  async create(createDto: CreateLeaveRequestDto, userId: string) {
    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        fromDate: new Date(createDto.fromDate),
        toDate: new Date(createDto.toDate),
        reason: createDto.reason,
        userId,
      },
    });

    // --- CREATE NOTIFICATIONS ---
    // For the employee who submitted
    await this.notificationService.createForUser(
      userId,
      'Your leave request has been submitted and is pending review.'
    );
    // For all users in the HR department
    await this.notificationService.createForDepartment(
      Department.HR,
      'A new leave request has been submitted for review.'
    );

    return leaveRequest;
  }

  async updateStatus(id: string, updateDto: UpdateLeaveStatusDto) {
    const updatedRequest = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: updateDto.status },
    });

    // --- CREATE NOTIFICATION FOR THE EMPLOYEE ---
    const message = `Your leave request for ${new Date(updatedRequest.fromDate).toLocaleDateString()} has been ${updateDto.status.toLowerCase()}.`;
    await this.notificationService.createForUser(updatedRequest.userId, message);

    return updatedRequest;
  }

  // For an employee to see their own requests
  async findAllForUser(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // For an HR manager to see all requests
  async findAll() {
    return this.prisma.leaveRequest.findMany({
      include: {
        user: {
          select: { name: true, familyName: true, position: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // For an HR manager to see only PENDING requests
  async findAllPending() {
    return this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { name: true, familyName: true, department: true },
        },
      },
      orderBy: { createdAt: 'asc' }, // Show oldest requests first
    });
  }
} 