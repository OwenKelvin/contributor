import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

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

  constructor() {
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
    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.logger.debug(`Welcome email sent to ${job.data.to}`);
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

      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.debug(`Password reset email sent to ${job.data.to}`);
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

      // In a real implementation, you would send the email using a service like SendGrid, AWS SES, etc.
      // For now, we'll just log it
      this.logger.log(`Payment success email rendered for ${job.data.to}`);
      this.logger.debug(`Email content length: ${html.length} characters`);
      
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      this.logger.debug(`Payment success email sent to ${job.data.to}`);
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
      
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      this.logger.debug(`Payment failure email sent to ${job.data.to}`);
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

      this.logger.log(`Refund notification email rendered for ${job.data.to}`);
      this.logger.debug(`Email content length: ${html.length} characters`);
      
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      this.logger.debug(`Refund notification email sent to ${job.data.to}`);
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
      
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      this.logger.debug(`Admin contribution confirmation email sent to ${job.data.to}`);
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
