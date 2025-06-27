import { IsArray, IsDateString, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleUpdate {
  // The ID of the shift it's being changed TO
  @IsString()
  @IsNotEmpty()
  newShiftId: string;

  // The department being changed
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  // The specific date of the change
  @IsDateString()
  @IsNotEmpty()
  date: string;
}

export class BulkUpdateScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleUpdate)
  updates: ScheduleUpdate[];
}
