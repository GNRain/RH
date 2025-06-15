import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(user: User, token: string) {
    const subject = 'Your Password Reset Code';
    const htmlBody = `
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Please use the following code to reset your password. This code is valid for 10 minutes.</p>
      <p>Your reset code is:</p>
      <h2 style="font-family: monospace; color: #333;">${token}</h2>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;

    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'),
      to: user.email,
      subject: subject,
      html: htmlBody,
    });
  }
}