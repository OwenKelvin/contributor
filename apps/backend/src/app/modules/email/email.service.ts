import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Contribution } from '../contribution/contribution.model';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcomeEmail(to: string, name: string) {
    await this.emailQueue.add('sendWelcomeEmail', {
      to,
      name,
    });
  }

  /**
   * Send payment success email to contributor
   * @param contribution - Contribution with user and project relationships loaded
   */
  async sendPaymentSuccessEmail(contribution: Contribution): Promise<void> {
    await this.emailQueue.add('sendPaymentSuccessEmail', {
      to: contribution.user.email,
      contributionId: contribution.id,
      amount: contribution.amount,
      projectTitle: contribution.project.title,
      contributorName: `${contribution.user.firstName} ${contribution.user.lastName}`,
      paidAt: contribution.paidAt,
    });
  }

  /**
   * Send payment failure email to contributor
   * @param contribution - Contribution with user and project relationships loaded
   * @param errorMessage - Error message from payment gateway
   */
  async sendPaymentFailureEmail(
    contribution: Contribution,
    errorMessage?: string
  ): Promise<void> {
    await this.emailQueue.add('sendPaymentFailureEmail', {
      to: contribution.user.email,
      contributionId: contribution.id,
      amount: contribution.amount,
      projectTitle: contribution.project.title,
      contributorName: `${contribution.user.firstName} ${contribution.user.lastName}`,
      errorMessage: errorMessage || 'Payment processing failed',
    });
  }

  /**
   * Send refund notification email to contributor
   * @param contribution - Contribution with user and project relationships loaded
   * @param reason - Reason for refund
   */
  async sendRefundNotificationEmail(
    contribution: Contribution,
    reason?: string
  ): Promise<void> {
    await this.emailQueue.add('sendRefundNotificationEmail', {
      to: contribution.user.email,
      contributionId: contribution.id,
      amount: contribution.amount,
      projectTitle: contribution.project.title,
      contributorName: `${contribution.user.firstName} ${contribution.user.lastName}`,
      reason: reason || 'Refund processed',
    });
  }
}
