// src/users/users.module.ts

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module'; // --- ADD IMPORT

@Module({
  imports: [PrismaModule, AuthModule, MailModule], // --- ADD MailModule
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}