import { Controller, Get, Body, Patch, UseGuards, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { BulkUpdateScheduleDto } from './dto/bulk-update-schedule.dto';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.HR, Role.DHR)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll(@Query() query: GetScheduleDto) {
    return this.schedulesService.findAll(query);
  }

  @Patch()
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateScheduleDto) {
    return this.schedulesService.bulkUpdate(bulkUpdateDto);
  }
}