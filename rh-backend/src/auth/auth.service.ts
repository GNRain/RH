// src/auth/auth.service.ts

import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(cin: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { cin },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'> & { isTwoFactorEnabled?: boolean }) {
    if (user.isTwoFactorEnabled) {
      const payload = {
        sub: user.id,
        cin: user.cin,
        isTwoFactorAuthenticated: false,
      };
      const partialToken = this.jwtService.sign(payload, { expiresIn: '5m' });
      return {
        message: '2FA code required',
        partial_token: partialToken,
      };
    }
    const payload = { sub: user.id, cin: user.cin, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  
  async requestPasswordReset(cin: string): Promise<{ message: string, resetTokenForTesting: string }> {
    const user = await this.prisma.user.findUnique({ where: { cin } });
    if (!user) {
      return { message: 'If a user with this CIN exists, a password reset link has been sent.', resetTokenForTesting: '' };
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken, passwordResetExpires },
    });
    console.log(`Password Reset Token for ${user.email}: ${resetToken}`);
    return { 
        message: 'Password reset token generated successfully.',
        resetTokenForTesting: resetToken 
    };
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }
    const newHashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    return { message: 'Password has been reset successfully.' };
  }

  async generateTwoFactorSecret(user: { id: string, email: string }) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'YourAppName', secret);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });
    return { otpauthUrl };
  }

  isTwoFactorCodeValid(code: string, user: User) {
    if (!user.twoFactorSecret) {
      return false;
    }
    return authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });
  }

  async turnOnTwoFactorAuth(code: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const isCodeValid = this.isTwoFactorCodeValid(code, user);
    if (!isCodeValid) throw new BadRequestException('Invalid authentication code');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isTwoFactorEnabled: true },
    });
    return { message: 'Two-factor authentication has been enabled successfully.' };
  }

  async authenticateTwoFactor(userFromPartialToken: { id: string }, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userFromPartialToken.id },
    });

    // If the user associated with the partial token doesn't exist anymore, reject.
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    // --- END OF FIX ---

    const isCodeValid = this.isTwoFactorCodeValid(code, user);

    if (!isCodeValid) {
      throw new BadRequestException('Invalid authentication code');
    }

    // If code is valid, issue the final, full-privilege JWT
    const payload = { sub: user.id, cin: user.cin, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}