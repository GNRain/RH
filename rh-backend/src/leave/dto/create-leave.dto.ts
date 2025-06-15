import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

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
}