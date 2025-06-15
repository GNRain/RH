import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationController } from './notification.controller'; // --- ADD IMPORT

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController], // --- ADD CONTROLLER ---
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}