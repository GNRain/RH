import { IsDateString, IsNotEmpty } from 'class-validator';
export class GetScheduleDto {
  @IsDateString() @IsNotEmpty() startDate: string;
  @IsDateString() @IsNotEmpty() endDate: string;
}