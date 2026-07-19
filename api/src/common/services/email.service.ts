import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private appUrl: string;

  constructor(private configService: ConfigService) {
    this.appUrl = this.configService.get('APP_URL') || 'http://localhost:5173';
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verifyUrl = `${this.appUrl}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: #1976D2; padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .body { padding: 30px; }
          .body p { color: #333; line-height: 1.6; }
          .btn { display: inline-block; background: #1976D2; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { padding: 20px 30px; background: #f9f9f9; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BoliviaExperience</h1>
          </div>
          <div class="body">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu cuenta ha sido creada exitosamente. Para comenzar a usar la app, verifica tu email haciendo click en el botón:</p>
            <p style="text-align: center;">
              <a href="${verifyUrl}" class="btn">Verificar mi email</a>
            </p>
            <p style="color: #666; font-size: 14px;">Si no creaste esta cuenta, puedes ignorar este email.</p>
          </div>
          <div class="footer">
            <p>BoliviaExperience — Toda Santa Cruz en la palma de tu mano</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM') || 'noreply@boliviaexperience.com',
      to: email,
      subject: 'Verifica tu email - BoliviaExperience',
      html,
    });
  }
}
