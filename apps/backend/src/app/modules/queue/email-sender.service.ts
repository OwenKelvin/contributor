import * as nodemailer from 'nodemailer';

export type EmailProvider = 'smtp' | 'sendgrid' | 'ses';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | string }[];
}

export class EmailSenderService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const provider = process.env.EMAIL_PROVIDER || 'smtp';
    if (provider === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      throw new Error('Only SMTP is implemented in this service.');
    }
  }

  async sendMail(options: EmailOptions): Promise<{ messageId: string }> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };
    const info = await this.transporter.sendMail(mailOptions);
    return { messageId: info.messageId };
  }
}
