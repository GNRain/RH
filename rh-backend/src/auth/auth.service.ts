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

  async validateUser(cin: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { cin },
      include: {
        department: true,
        position: true,
      },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    if (user.isTwoFactorEnabled) {
      const payload = { sub: user.id, cin: user.cin };
      const partialToken = this.jwtService.sign(payload, { expiresIn: '10m' });
      return { message: '2FA code required', partial_token: partialToken };
    }

    const payload = {
      sub: user.id,
      cin: user.cin,
      department: user.department.name,
      position: user.position.name,
      role: user.role,
      isTwoFactorAuthenticated: false,
    };
    return { 
      access_token: this.jwtService.sign(payload, { expiresIn: '8h' }) 
    };
  }
  
  async initiateTwoFactorSetup(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.email) {
      throw new NotFoundException('User not found or has no email address configured.');
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'RH-Portal', secret);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return {
      qrCodeImage: await qrcode.toDataURL(otpauthUrl),
    };
  }

  async turnOnTwoFactorAuth(code: string, userId: string) {
    const user = await this.prisma.user.findUnique({ 
        where: { id: userId },
        include: { department: true, position: true }
    });
    if (!user) throw new NotFoundException('User not found');
    
    const isCodeValid = this.isTwoFactorCodeValid(code, user);
    if (!isCodeValid) throw new BadRequestException('Invalid authentication code');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isTwoFactorEnabled: true },
    });
    
    const payload = { 
        sub: user.id, cin: user.cin, 
        department: user.department.name, position: user.position.name,
        role: user.role,
        isTwoFactorAuthenticated: true,
    };
    return { access_token: this.jwtService.sign(payload) };
  }

  // --- NEW METHOD START ---
  async turnOffTwoFactorAuth(code: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled.');
    }

    const isCodeValid = this.isTwoFactorCodeValid(code, user);
    if (!isCodeValid) throw new BadRequestException('Invalid authentication code');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null, // Remove the secret
      },
    });

    return { message: 'Two-factor authentication has been disabled.' };
  }
  // --- NEW METHOD END ---

  async authenticateTwoFactor(userFromPartialToken: { sub: string }, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userFromPartialToken.sub },
      include: { department: true, position: true }
    });

    if (!user) throw new UnauthorizedException('User not found.');

    const isCodeValid = this.isTwoFactorCodeValid(code, user);
    if (!isCodeValid) throw new BadRequestException('Invalid authentication code');
    
    const payload = { 
        sub: user.id, cin: user.cin, 
        department: user.department.name, position: user.position.name,
        role: user.role,
        isTwoFactorAuthenticated: true,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
  
  decodePartialToken(token: string): { sub: string } | null {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async requestPasswordReset(cin: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { cin } });
    if (user) {
      const resetCode = crypto.randomInt(100000, 999999).toString();
      const passwordResetToken = await bcrypt.hash(resetCode, 10);
      const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
      await this.prisma.user.update({ where: { id: user.id }, data: { passwordResetToken, passwordResetExpires }});
      try {
        await this.mailService.sendPasswordResetEmail(user, resetCode);
      } catch (error) { console.error('Failed to send password reset email:', error); }
    }
    return { message: 'If an account with that CIN exists, a password reset code has been sent to the registered email.' };
  }

  async resetPassword(userId: string, resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const newHashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword, passwordResetToken: null, passwordResetExpires: null },
    });
    return { message: 'Password has been reset successfully.' };
  }

  isTwoFactorCodeValid(code: string, user: User) {
    if (!user.twoFactorSecret) return false;
    return authenticator.verify({ token: code, secret: user.twoFactorSecret });
  }

  async verifyResetCode(verifyDto: { cin: string, code: string }): Promise<{ reset_session_token: string }> {
    const user = await this.prisma.user.findUnique({ where: { cin: verifyDto.cin } });
    if (!user || !user.passwordResetToken || !user.passwordResetExpires) throw new BadRequestException('Invalid reset code or CIN.');
    if (new Date() > user.passwordResetExpires) throw new BadRequestException('Reset code has expired.');
    const isCodeValid = await bcrypt.compare(verifyDto.code, user.passwordResetToken);
    if (!isCodeValid) throw new BadRequestException('Invalid reset code.');
    const payload = { sub: user.id, purpose: 'password-reset' };
    const resetSessionToken = this.jwtService.sign(payload, { expiresIn: '5m' });
    return { reset_session_token: resetSessionToken };
  }
}