import { IsHexColor, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator'; // --- ADD ValidateIf

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Add the color field, ensuring it's a valid hex color
  @IsHexColor()
  @IsNotEmpty()
  color: string;

  // Add the optional defaultShiftId, allowing it to be a string or null
  @IsOptional()
  defaultShiftId?: string | null; // Allow null
}