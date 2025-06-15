// src/auth/auth.controller.ts

import { Controller, Post, UseGuards, Request, Body, Param, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';
import * as qrcode from 'qrcode';
import { TwoFactorAuthCodeDto } from './dto/two-factor-auth-code.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles user login. The @UseGuards(AuthGuard('local')) decorator
   * automatically triggers the LocalStrategy we created.
   * If the strategy validates the user, it attaches the user object
   * to the request, and this method's code is executed.
   * If validation fails, the strategy throws an exception, and this
   * method is never reached.
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    // At this point, req.user contains the validated user object from our LocalStrategy
    return this.authService.login(req.user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto.cin);
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  async generateTwoFactor(
    @Request() req,
    @Res() res: Response,
  ) {
    // req.user is attached by JwtAuthGuard and contains { id, cin, role }
    const { otpauthUrl } = await this.authService.generateTwoFactorSecret(req.user);

    // Convert the otpauthUrl to a QR code image
    const qrCodeImage = await qrcode.toDataURL(otpauthUrl);
    
    // Send the QR code image back as the response
    return res.json({ qrCodeImage });
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuth(
    @Request() req,
    @Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto,
  ) {
    return this.authService.turnOnTwoFactorAuth(
      twoFactorAuthCodeDto.code,
      req.user.id,
    );
  }

  
  @Post('2fa/authenticate')
  @UseGuards(JwtAuthGuard)
  async authenticateTwoFactor(
    @Request() req,
    @Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto,
  ) {
    // req.user will contain the payload from the partial token
    return this.authService.authenticateTwoFactor(
      req.user,
      twoFactorAuthCodeDto.code,
    );
  }
}