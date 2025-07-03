// src/auth/dto/login-user.dto.ts

import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  cin: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  twoFactorCode?: string;
}