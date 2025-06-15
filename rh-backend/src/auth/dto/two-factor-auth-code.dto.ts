// src/auth/dto/two-factor-auth-code.dto.ts

import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TwoFactorAuthCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Code must be 6 digits long' })
  code: string;
}