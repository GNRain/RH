// src/auth/auth.controller.ts

import { Controller, Post, UseGuards, Request, Body, Param, Res, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';
import * as qrcode from 'qrcode';
import { TwoFactorAuthCodeDto } from './dto/two-factor-auth-code.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto'

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
    // The LocalStrategy attaches the user object to `req.user`.
    // We pass the entire object to the login service.
    return this.authService.login(req.user); // <-- MODIFIED
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
      req.user.sub,
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

  // --- ADD THIS NEW ENDPOINT ---
  @Post('verify-reset-code')
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCodeDto);
  }

  // We are replacing the old reset-password endpoint with this new one.
  // It is protected by the standard JWT guard.
  @Post('set-new-password')
  @UseGuards(JwtAuthGuard)
  async setNewPassword(
    @Request() req,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    // The JwtAuthGuard now attaches the full payload to req.user
    const userId = req.user.sub; // The user ID is in the 'sub' claim
    const purpose = req.user.purpose;

    if (purpose !== 'password-reset') {
        throw new UnauthorizedException('Invalid token purpose.');
    }
    
    // We now pass the userId to the service method
    return this.authService.resetPassword(userId, resetPasswordDto);
  }
}