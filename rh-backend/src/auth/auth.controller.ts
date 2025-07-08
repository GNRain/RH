import { Controller, Post, Body, UseGuards, Request, Get, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { TwoFactorAuthCodeDto } from './dto/two-factor-auth-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() loginUserDto: LoginUserDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('2fa/authenticate')
  async authenticate(@Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto) {
    const { partial_token, code } = twoFactorAuthCodeDto;
    
    const userFromPartialToken = this.authService.decodePartialToken(partial_token);
    
    if (!userFromPartialToken) {
        throw new UnauthorizedException('Invalid or expired 2FA session.');
    }
    
    return this.authService.authenticateTwoFactor(userFromPartialToken, code);
  }

  @Get('2fa/generate')
  @UseGuards(AuthGuard('jwt'))
  async generateQrCode(@Request() req) {
    return this.authService.initiateTwoFactorSetup(req.user.sub);
  }

  @Post('2fa/turn-on')
  @UseGuards(AuthGuard('jwt'))
  async turnOnTwoFactorAuth(@Request() req, @Body('code') twoFactorCode: string) {
    return this.authService.turnOnTwoFactorAuth(twoFactorCode, req.user.sub);
  }

  @Post('2fa/turn-off')
  @UseGuards(AuthGuard('jwt'))
  async turnOffTwoFactorAuth(@Request() req, @Body('code') twoFactorCode: string) {
    return this.authService.turnOffTwoFactorAuth(twoFactorCode, req.user.sub);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto.cin);
  }

  @Public()
  @Post('verify-reset-code')
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCodeDto);
  }

  // --- THIS IS THE FIX ---
  // The route is changed from 'reset-password' to 'set-new-password'
  @Post('set-new-password')
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(@Request() req, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(req.user.sub, resetPasswordDto);
  }
}