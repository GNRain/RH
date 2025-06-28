import { IsHexColor, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Add the color field, ensuring it's a valid hex color
  @IsHexColor()
  @IsNotEmpty()
  color: string;

  // Add the optional defaultShiftId, ensuring it's a valid UUID
  @IsUUID()
  @IsOptional()
  defaultShiftId?: string;
}