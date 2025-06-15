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
  ],
  controllers: [AppController],
  providers: [AppService], // UsersService was correctly removed in the previous step
})
export class AppModule {}