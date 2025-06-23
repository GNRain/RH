// src/leave/dto/update-leave-action.dto.ts

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from '@prisma/client';

export class UpdateLeaveActionDto {
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}