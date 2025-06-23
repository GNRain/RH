import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('hr')
  @Roles(Role.HR, Role.DHR) // Only users with HR or DHR role can access this
  getHrDashboardData() {
    return this.dashboardService.getHrDashboardData();
  }
}