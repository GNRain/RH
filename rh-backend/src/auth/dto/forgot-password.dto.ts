// src/auth/dto/forgot-password.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  cin: string;
}