// src/schedules/schedules.controller.ts

import { Controller, Get, Body, Patch, UseGuards, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { BulkUpdateScheduleDto } from './dto/bulk-update-schedule.dto';
import { GeneratedScheduleDto } from './dto/schedule.dto';

@Controller('schedules')
@UseGuards(JwtAuthGuard) // Apply basic authentication to all routes in this controller
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get() // This endpoint is now accessible to all logged-in users
  findAll(@Query() query: GetScheduleDto): Promise<GeneratedScheduleDto[]> {
    return this.schedulesService.findAll(query);
  }

  @Patch()
  @UseGuards(RolesGuard) // Only this route is protected by the RolesGuard
  @Roles(Role.HR, Role.DHR) // Only HR and DHR can update the schedule
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateScheduleDto) {
    return this.schedulesService.bulkUpdate(bulkUpdateDto);
  }
}