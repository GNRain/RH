// src/users/dto/create-user.dto.ts

import { Department, Role, UserStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password_to_be_hashed: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  familyName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  cin: string;

  @IsString()
  @IsNotEmpty()
  positionId: string;
  
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  // --- ADDED/MODIFIED FIELDS ---
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  teamLeaderId?: string;
  
  @IsString()
  @IsOptional()
  managerId?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}