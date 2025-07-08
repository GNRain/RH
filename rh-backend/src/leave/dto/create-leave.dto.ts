import { IsDateString, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { LeaveType } from '@prisma/client'; // Import the enum

export class CreateLeaveRequestDto {
  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @IsDateString()
  @IsNotEmpty()
  toDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
  
  // --- ADD THIS LINE ---
  @IsEnum(LeaveType)
  @IsNotEmpty()
  type: LeaveType;
}