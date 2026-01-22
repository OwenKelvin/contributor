import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { EmailSenderService } from './email-sender.service';
import { EmailLogService } from './email-log.service';
import { ActivityAction, TargetType } from '../activity/activity.model';

interface PaymentSuccessEmailData {
  to: string;
  contributionId: string;
  amount: number;
  projectTitle: string;
  contributorName: string;
  paidAt: Date;
  paymentReference?: string;
}

interface PaymentFailureEmailData {
  to: string;
  contributionId: string;
  amount: number;
  projectTitle: string;
  contributorName: string;
  errorMessage: string;
}

interface RefundNotificationEmailData {
  to: string;
  contributionId: string;
  amount: number;
  projectTitle: string;
  contributorName: string;
  paidAt: Date;
  refundDate: Date;
  reason?: string;
}

interface AdminContributionConfirmationEmailData {
  to: string;
  contributionId: string;
  amount: number;
  projectTitle: string;
  contributorName: string;
  createdAt: Date;
  isPaid: boolean;
  paymentReference?: string;
  notes?: string;
}

interface PasswordResetEmailData {
  to: string;
  name: string;
  resetLink: string;
}

@Processor('email')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);
  private readonly templatesPath = path.join(__dirname, '../email/templates');
  private readonly organizationName = process.env.ORGANIZATION_NAME || 'Our Organization';
  private readonly dashboardUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard/contributions` : 'http://localhost:4200/dashboard/contributions';
  private readonly supportUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/support` : 'http://localhost:4200/support';

  private readonly emailSender = new EmailSenderService();

  constructor(private emailLogService: EmailLogService ) {
    // Register Handlebars helpers
    Handlebars.registerHelper('if', function(conditional, options) {
      if (conditional) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
  }

  @Process('sendWelcomeEmail')
  async sendWelcomeEmail(job: Job<{ to: string; name: string }>) {
    this.logger.debug(`Sending welcome email to ${job.data.to}`);
    const html = `<p>Welcome, ${job.data.name}!</p>`;
    const text = `Welcome, ${job.data.name}!`;
    let attempt = 0;
    let sent = false;
    let lastError;
    while (!sent && attempt < 3) {
      try {
        await this.emailSender.sendMail({
          to: job.data.to,
          subject: 'Welcome',
          html,
          text,
        });
        sent = true;
      } catch (err) {
        attempt++;
        lastError = err;
        this.logger.warn(`Retrying welcome email (${attempt}/3): ${err.message}`);
      }
    }
    if (!sent) throw lastError;
    this.logger.debug(`Welcome email sent to ${job.data.to}`);
    await this.emailLogService.logEmailSend({
      userId: job.data.to,
      action: ActivityAction.USER_CREATED,
      targetId: undefined,
      targetType: TargetType.USER,
      details: JSON.stringify({ email: job.data.to, type: 'welcome' }),
    });
    return {};
  }

  @Process('sendPasswordResetEmail')
  async sendPasswordResetEmail(job: Job<PasswordResetEmailData>) {
    this.logger.debug(`Sending password reset email to ${job.data.to}`);

    try {
      const template = this.loadTemplate('password-reset.html');
      const html = this.renderTemplate(template, {
        ...job.data,
        organizationName: this.organizationName,
        year: new Date().getFullYear(),
      });

      this.logger.log(`Password reset email rendered for ${job.data.to}`);
      this.logger.debug(`Email content length: ${html.length} characters`);

      // Send email with retry logic
      const text = `Hi ${job.data.name},\nReset your password: ${job.data.resetLink}`;
      let attempt = 0;
      let sent = false;
      let lastError;
      while (!sent && attempt < 3) {
        try {
          await this.emailSender.sendMail({
            to: job.data.to,
            subject: 'Password Reset',
            html,
            text,
          });
          sent = true;
        } catch (err) {
          attempt++;
          lastError = err;
          this.logger.warn(`Retrying password reset email (${attempt}/3): ${err.message}`);
        }
      }
      if (!sent) throw lastError;
      this.logger.debug(`Password reset email sent to ${job.data.to}`);
      await this.emailLogService.logEmailSend({
        userId: job.data.to,
        action: ActivityAction.PASSWORD_RESET_REQUEST,
        targetId: undefined,
        targetType: TargetType.USER,
        details: JSON.stringify({ email: job.data.to, type: 'password-reset' }),
      });
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('sendPaymentSuccessEmail')
  async sendPaymentSuccessEmail(job: Job<PaymentSuccessEmailData>) {
    this.logger.debug(`Sending payment success email to ${job.data.to}`);

    try {
      const template = this.loadTemplate('payment-success.html');
      const html = this.renderTemplate(template, {
        ...job.data,
        amount: this.formatCurrency(job.data.amount),
        paidAt: this.formatDate(job.data.paidAt),
        dashboardUrl: this.dashboardUrl,
        organizationName: this.organizationName,
        year: new Date().getFullYear(),
      });

      this.logger.log(`Payment success email rendered for ${job.data.to}`);
      this.logger.debug(`Email content length: ${html.length} characters`);
      const text = `Hi ${job.data.contributorName},\nYour payment of ${job.data.amount} for ${job.data.projectTitle} was successful.`;
      // Send email with retry logic
      let attempt = 0;
      let sent = false;
      let lastError;
      while (!sent && attempt < 3) {
        try {
          await this.emailSender.sendMail({
            to: job.data.to,
            subject: 'Payment Success',
            html,
            text,
          });
          sent = true;
        } catch (err) {
          attempt++;
          lastError = err;
          this.logger.warn(`Retrying payment success email (${attempt}/3): ${err.message}`);
        }
      }
      if (!sent) throw lastError;
      this.logger.debug(`Payment success email sent to ${job.data.to}`);
      await this.emailLogService.logEmailSend({
        userId: job.data.to,
        action: ActivityAction.CONTRIBUTION_CREATED,
        targetId: job.data.contributionId,
        targetType: TargetType.CONTRIBUTION,
        details: JSON.stringify({ email: job.data.to, type: 'payment-success' }),
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send payment success email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('sendPaymentFailureEmail')
  async sendPaymentFailureEmail(job: Job<PaymentFailureEmailData>) {
    this.logger.debug(`Sending payment failure email to ${job.data.to}`);

    try {
      const template = this.loadTemplate('payment-failure.html');
      const html = this.renderTemplate(template, {
        ...job.data,
        amount: this.formatCurrency(job.data.amount),
        retryPaymentUrl: `${this.dashboardUrl}/${job.data.contributionId}`,
        supportUrl: this.supportUrl,
        organizationName: this.organizationName,
        year: new Date().getFullYear(),
      });

      this.logger.log(`Payment failure email rendered for ${job.data.to}`);
      this.logger.debug(`Email content length: ${html.length} characters`);
      const text = `Hi ${job.data.contributorName},\nYour payment for ${job.data.projectTitle} failed. Reason: ${job.data.errorMessage}`;
      // Send email with retry logic
      let attempt = 0;
      let sent = false;
      let lastError;
      while (!sent && attempt < 3) {
        try {
          await this.emailSender.sendMail({
            to: job.data.to,
            subject: 'Payment Failure',
            html,
            text,
          });
          sent = true;
        } catch (err) {
          attempt++;
          lastError = err;
          this.logger.warn(`Retrying payment failure email (${attempt}/3): ${err.message}`);
        }
      }
      if (!sent) throw lastError;
      this.logger.debug(`Payment failure email sent to ${job.data.to}`);
      await this.emailLogService.logEmailSend({
        userId: job.data.to,
        action: ActivityAction.CONTRIBUTION_UPDATED,
        targetId: job.data.contributionId,
        targetType: TargetType.CONTRIBUTION,
        details: JSON.stringify({ email: job.data.to, type: 'payment-failure' }),
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send payment failure email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('sendRefundNotificationEmail')
  async sendRefundNotificationEmail(job: Job<RefundNotificationEmailData>) {
    this.logger.debug(`Sending refund notification email to ${job.data.to}`);

    try {
      const template = this.loadTemplate('refund-notification.html');
      const html = this.renderTemplate(template, {
        ...job.data,
        amount: this.formatCurrency(job.data.amount),
        paidAt: this.formatDate(job.data.paidAt),
        refundDate: this.formatDate(job.data.refundDate),
        dashboardUrl: this.dashboardUrl,
        organizationName: this.organizationName,
        year: new Date().getFullYear(),
      });
      const text = `Hi ${job.data.contributorName},\nYour refund for ${job.data.projectTitle} has been processed. Amount: ${job.data.amount}`;
      // Send email with retry logic
      let attempt = 0;
      let sent = false;
      let lastError;
      while (!sent && attempt < 3) {
        try {
          await this.emailSender.sendMail({
            to: job.data.to,
            subject: 'Refund Notification',
            html,
            text,
          });
          sent = true;
        } catch (err) {
          attempt++;
          lastError = err;
          this.logger.warn(`Retrying refund notification email (${attempt}/3): ${err.message}`);
        }
      }
      if (!sent) throw lastError;
      this.logger.debug(`Refund notification email sent to ${job.data.to}`);
      await this.emailLogService.logEmailSend({
        userId: job.data.to,
        action: ActivityAction.CONTRIBUTION_UPDATED,
        targetId: job.data.contributionId,
        targetType: TargetType.CONTRIBUTION,
        details: JSON.stringify({ email: job.data.to, type: 'refund-notification' }),
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send refund notification email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('sendAdminContributionConfirmationEmail')
  async sendAdminContributionConfirmationEmail(job: Job<AdminContributionConfirmationEmailData>) {
    this.logger.debug(`Sending admin contribution confirmation email to ${job.data.to}`);

    try {
      const template = this.loadTemplate('admin-contribution-confirmation.html');
      const html = this.renderTemplate(template, {
        ...job.data,
        amount: this.formatCurrency(job.data.amount),
        createdAt: this.formatDate(job.data.createdAt),
        dashboardUrl: this.dashboardUrl,
        organizationName: this.organizationName,
        year: new Date().getFullYear(),
      });

      this.logger.log(`Admin contribution confirmation email rendered for ${job.data.to}`);
      this.logger.debug(`Email content length: ${html.length} characters`);

      const text = `Contribution ${job.data.contributionId} for ${job.data.projectTitle} by ${job.data.contributorName} has been confirmed.`;
      // Send email with retry logic
      let attempt = 0;
      let sent = false;
      let lastError;
      while (!sent && attempt < 3) {
        try {
          await this.emailSender.sendMail({
            to: job.data.to,
            subject: 'Contribution Confirmation',
            html,
            text,
          });
          sent = true;
        } catch (err) {
          attempt++;
          lastError = err;
          this.logger.warn(`Retrying admin contribution confirmation email (${attempt}/3): ${err.message}`);
        }
      }
      if (!sent) throw lastError;
      this.logger.debug(`Admin contribution confirmation email sent to ${job.data.to}`);
      await this.emailLogService.logEmailSend({
        userId: job.data.to,
        action: ActivityAction.CONTRIBUTION_UPDATED,
        targetId: job.data.contributionId,
        targetType: TargetType.CONTRIBUTION,
        details: JSON.stringify({ email: job.data.to, type: 'admin-contribution-confirmation' }),
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send admin contribution confirmation email: ${error.message}`, error.stack);
      throw error;
    }
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesPath, templateName);
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}: ${error.message}`);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  private renderTemplate(template: string, data: any): string {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }
}
