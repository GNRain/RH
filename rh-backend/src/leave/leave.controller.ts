// src/leave/leave.controller.ts

import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { UpdateLeaveActionDto } from './dto/update-leave-action.dto'; // --- NEW: Import the action DTO

@Controller('leave')
@UseGuards(JwtAuthGuard) // Protect all leave-related endpoints
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  /**
   * Endpoint for an employee to submit a new leave request.
   * The logic in the service now builds the full approval chain.
   */
  @Post()
  create(@Body() createLeaveDto: CreateLeaveRequestDto, @Request() req) {
    const userId = req.user.sub;
    return this.leaveService.create(createLeaveDto, userId);
  }

  /**
   * Endpoint for an employee to get their own leave request history.
   * The service is now updated to include the full approval chain in the response.
   */
  @Get('my-requests')
  findUserRequests(@Request() req) {
    const userId = req.user.sub;
    return this.leaveService.findAllForUser(userId);
  }

  /**
   * --- NEW ENDPOINT ---
   * For any approver (TL, Manager, HR, etc.) to get a list
   * of leave requests waiting for their action.
   */
  @Get('pending-actions')
  findPendingActions(@Request() req) {
    const userId = req.user.sub;
    return this.leaveService.findPendingForUser(userId);
  }
  
  @Get('balance')
  async getBalance(@Request() req) {
  return this.leaveService.getLeaveBalance(req.user.sub);
}
  /**
   * --- NEW ENDPOINT ---
   * For an approver to submit their decision (Approve/Decline) on a request.
   * This replaces the old `/status` endpoint.
   */
  @Patch(':id/action')
  processLeaveAction(
    @Param('id') leaveRequestId: string,
    @Request() req,
    @Body() actionDto: UpdateLeaveActionDto,
  ) {
    const actingUserId = req.user.sub;
    return this.leaveService.processApprovalAction(leaveRequestId, actingUserId, actionDto);
  }
}