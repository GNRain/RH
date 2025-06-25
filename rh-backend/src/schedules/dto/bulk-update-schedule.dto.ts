import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
class ScheduleUpdate {
  @IsString() @IsNotEmpty() scheduleId: string;
  @IsString() @IsNotEmpty() newShiftId: string;
  @IsString() @IsNotEmpty() originalDepartmentId: string;
}
export class BulkUpdateScheduleDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ScheduleUpdate)
  updates: ScheduleUpdate[];
}