import { IsString, IsNotEmpty, Length } from 'class-validator';

export class TwoFactorAuthCodeDto {
  @IsString()
  @IsNotEmpty()
  partial_token: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}