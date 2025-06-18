// src/users/dto/create-user.dto.ts

import { Department, UserStatus } from '@prisma/client';
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
  position: string;

  @IsEnum(Department)
  @IsNotEmpty()
  department: Department;

  @IsEnum(UserStatus)
  @IsOptional() // Make it optional during creation, as it has a default value
  status?: UserStatus;
}