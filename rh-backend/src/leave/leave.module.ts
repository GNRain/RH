import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/notifications/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}