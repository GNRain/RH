import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/notifications/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}