import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config'; // --- ADD IMPORT
import { MailModule } from './mail/mail.module';   // --- ADD IMPORT
import { LeaveModule } from './leave/leave.module';
import { NotificationModule } from './notifications/notification.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ShiftsModule } from './shifts/shifts.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  // --- MODIFIED IMPORTS ---
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Make .env variables available globally
    PrismaModule,
    AuthModule,
    UsersModule,
    MailModule,
    LeaveModule,
    NotificationModule,
    DepartmentsModule,
    PositionsModule,
    DashboardModule,
    ShiftsModule,
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService], // UsersService was correctly removed in the previous step
})
export class AppModule {}