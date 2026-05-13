import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST'),
      port: config.get<number>('MAIL_PORT'),
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const url = `${this.config.get('APP_URL')}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: this.config.get('MAIL_FROM'),
      to: email,
      subject: 'И-мэйл баталгаажуулах - Finance Tracker',
      html: `
        <h2>Сайн байна уу, ${name}!</h2>
        <p>Доорх холбоосоор и-мэйлээ баталгаажуулна уу:</p>
        <a href="${url}" style="background:#3B82F6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
          И-мэйл баталгаажуулах
        </a>
        <p>Холбоос 24 цагийн дараа хүчингүй болно.</p>
      `,
    }).catch(err => this.logger.error('Mail error:', err));
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const url = `${this.config.get('APP_URL')}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: this.config.get('MAIL_FROM'),
      to: email,
      subject: 'Нууц үг шинэчлэх - Finance Tracker',
      html: `
        <h2>Сайн байна уу, ${name}!</h2>
        <p>Нууц үг шинэчлэхийн тулд доорх холбоосыг дарна уу:</p>
        <a href="${url}" style="background:#EF4444;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Нууц үг шинэчлэх
        </a>
        <p>Холбоос 1 цагийн дараа хүчингүй болно.</p>
      `,
    }).catch(err => this.logger.error('Mail error:', err));
  }
}
