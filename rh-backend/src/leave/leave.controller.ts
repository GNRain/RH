import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { Department } from '@prisma/client'; // --- Import Department ---
import { Departments } from 'src/auth/decorators/departments.decorator'; // --- Import new decorator ---
import { DepartmentsGuard } from 'src/auth/guards/departments.guard'; // --- Import new guard ---
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveRequestDto, @Request() req) {
    const userId = req.user.sub;
    return this.leaveService.create(createLeaveDto, userId);
  }

  @Get('my-requests')
  findUserRequests(@Request() req) {
    const userId = req.user.sub;
    return this.leaveService.findAllForUser(userId);
  }

  @Get('pending')
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  findAllPending() {
    return this.leaveService.findAllPending();
  }

  @Get('all')
  // --- USE NEW GUARD AND DECORATOR ---
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  findAll() {
    return this.leaveService.findAll();
  }

  @Patch(':id/status')
  // --- USE NEW GUARD AND DECORATOR ---
  @UseGuards(DepartmentsGuard)
  @Departments(Department.HR)
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateLeaveStatusDto) {
    return this.leaveService.updateStatus(id, updateStatusDto);
  }
}