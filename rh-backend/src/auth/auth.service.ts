// src/auth/auth.service.ts

import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(cin: string, pass: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { cin },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      return user; // Return the full user object
    }
    return null;
  }

  async login(user: User) {
    // --- START OF MODIFIED LOGIC ---

    const payload = {
      sub: user.id,
      cin: user.cin,
    };
    // This token is temporary, allowing access only to the 2FA endpoints.
    const partialToken = this.jwtService.sign(payload, { expiresIn: '10m' });

    // If 2FA is already enabled, just ask for the code.
    if (user.isTwoFactorEnabled) {
      return {
        message: '2FA code required',
        partial_token: partialToken,
      };
    }

    // If 2FA is NOT enabled, we must force the setup.
    const { otpauthUrl, secret } = await this.generateTwoFactorSecret(user);
    const qrCodeImage = await qrcode.toDataURL(otpauthUrl);
    
    // Store the new secret so we can verify the user's first code.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return {
      message: '2FA setup required',
      qrCodeImage,
      partial_token: partialToken,
    };
    // --- END OF MODIFIED LOGIC ---
  }
  
  async requestPasswordReset(cin: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { cin } });
    
    if (user) {
      // --- START OF MODIFICATION ---
      // Generate a random 8-digit code.
      const resetCode = crypto.randomInt(10000000, 99999999).toString();
      const passwordResetToken = await bcrypt.hash(resetCode, 10); // Hash the numeric code
      // --- END OF MODIFICATION ---

      const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken, passwordResetExpires },
      });

      try {
        // --- Pass the new 8-digit code to the email service ---
        await this.mailService.sendPasswordResetEmail(user, resetCode);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
      }
    }
    
    return { 
        message: 'If an account with that CIN exists, a password reset code has been sent to the registered email.',
    };
  }


  async resetPassword(userId: string, resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const newHashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: newHashedPassword,
        passwordResetToken: null, // Clear the token so it can't be reused
        passwordResetExpires: null,
      },
    });

    return { message: 'Password has been reset successfully.' };
  }
  
  async generateTwoFactorSecret(user: { email: string }) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'RH-Portal', secret);
    return { otpauthUrl, secret };
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

    // --- START OF MODIFIED LOGIC ---
    // If the code is valid, enable 2FA for the user.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isTwoFactorEnabled: true },
    });
    
    // Then, issue the final, full-privilege access token to complete the login.
    const payload = { sub: user.id, cin: user.cin, department: user.department };
    return {
      access_token: this.jwtService.sign(payload),
    };
    // --- END OF MODIFIED LOGIC ---
  }

  async authenticateTwoFactor(
    userFromPartialToken: { sub: string }, // Expect 'sub' from the JWT payload
    code: string
  ) {
    const user = await this.prisma.user.findUnique({
      // Use the 'sub' field to find the user by their ID
      where: { id: userFromPartialToken.sub }, 
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isCodeValid = this.isTwoFactorCodeValid(code, user);

    if (!isCodeValid) {
      throw new BadRequestException('Invalid authentication code');
    }
    
    // The rest of the logic remains the same
    const payload = { sub: user.id, cin: user.cin, department: user.department };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyResetCode(verifyDto: { cin: string, code: string }): Promise<{ reset_session_token: string }> {
    const user = await this.prisma.user.findUnique({ where: { cin: verifyDto.cin } });

    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      throw new BadRequestException('Invalid reset code or CIN.');
    }

    if (new Date() > user.passwordResetExpires) {
      throw new BadRequestException('Reset code has expired.');
    }

    const isCodeValid = await bcrypt.compare(verifyDto.code, user.passwordResetToken);

    if (!isCodeValid) {
      throw new BadRequestException('Invalid reset code.');
    }

    // If code is valid, issue a short-lived token specifically for resetting the password.
    const payload = { sub: user.id, purpose: 'password-reset' };
    const resetSessionToken = this.jwtService.sign(payload, { expiresIn: '5m' });

    return { reset_session_token: resetSessionToken };
  }
}