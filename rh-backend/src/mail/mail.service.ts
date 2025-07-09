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

  async sendWelcomeEmail(user: User) {
    const subject = 'Welcome to the Company!';
    const htmlBody = `
      <p>Dear ${user.name} ${user.familyName},</p>
      <p>Welcome to the company! We are thrilled to have you join our team.</p>
      <p>Your account has been successfully created. You can now log in using your email address (${user.email}) and the password you set during registration.</p>
      <p>We look forward to your contributions and wish you a successful journey with us.</p>
      <p>Best regards,</p>
      <p>The HR Team</p>
    `;

    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'),
      to: user.email,
      subject: subject,
      html: htmlBody,
    });
  }
}