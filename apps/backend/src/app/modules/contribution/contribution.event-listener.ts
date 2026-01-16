import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/sequelize';
import { Contribution, PaymentStatus } from './contribution.model';
import { TransactionService } from './transaction.service';
import { EmailService } from '../email/email.service';
import {
  PaymentSuccessEvent,
  PaymentFailureEvent,
  PAYMENT_EVENTS,
} from '../payment/events/payment.events';

/**
 * Contribution Event Listener
 * Listens to payment events and updates contribution status accordingly
 */
@Injectable()
export class ContributionEventListener {
  private readonly logger = new Logger(ContributionEventListener.name);

  constructor(
    @InjectModel(Contribution)
    private contributionModel: typeof Contribution,
    private transactionService: TransactionService,
    private emailService: EmailService
  ) {}

  /**
   * Handle payment success event
   * Updates contribution status to paid and sends confirmation email
   */
  @OnEvent(PAYMENT_EVENTS.PAYMENT_SUCCESS)
  async handlePaymentSuccess(event: PaymentSuccessEvent) {
    this.logger.log(
      `Payment success event received: ${event.checkoutRequestId}`
    );

    try {
      // Find contribution by checkout request ID (stored in payment reference)
      const contribution = await this.contributionModel.findOne({
        where: {
          paymentReference: event.checkoutRequestId,
        },
        include: ['user', 'project'],
      });

      if (!contribution) {
        this.logger.warn(
          `Contribution not found for checkout request: ${event.checkoutRequestId}`
        );
        return;
      }

      // Update contribution status
      contribution.paymentStatus = PaymentStatus.PAID;
      contribution.paidAt = new Date(event.transactionDate);
      await contribution.save();

      this.logger.log(
        `Contribution ${contribution.id} marked as paid`
      );

      // Send confirmation email
      try {
        await this.emailService.sendPaymentSuccessEmail(contribution);
      } catch (emailError) {
        this.logger.error(
          `Failed to send payment success email: ${emailError.message}`
        );
        // Don't throw - email failure shouldn't affect payment processing
      }
    } catch (error) {
      this.logger.error(
        `Error handling payment success event: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Handle payment failure event
   * Updates contribution status to failed and sends notification email
   */
  @OnEvent(PAYMENT_EVENTS.PAYMENT_FAILURE)
  async handlePaymentFailure(event: PaymentFailureEvent) {
    this.logger.log(
      `Payment failure event received: ${event.checkoutRequestId}`
    );

    try {
      // Find contribution by checkout request ID
      const contribution = await this.contributionModel.findOne({
        where: {
          paymentReference: event.checkoutRequestId,
        },
        include: ['user', 'project'],
      });

      if (!contribution) {
        this.logger.warn(
          `Contribution not found for checkout request: ${event.checkoutRequestId}`
        );
        return;
      }

      // Update contribution status
      contribution.paymentStatus = PaymentStatus.FAILED;
      contribution.failureReason = `${event.resultDesc} (Code: ${event.resultCode})`;
      await contribution.save();

      this.logger.log(
        `Contribution ${contribution.id} marked as failed: ${contribution.failureReason}`
      );

      // Send failure notification email
      try {
        await this.emailService.sendPaymentFailureEmail(
          contribution,
          event.resultDesc
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send payment failure email: ${emailError.message}`
        );
        // Don't throw - email failure shouldn't affect payment processing
      }
    } catch (error) {
      this.logger.error(
        `Error handling payment failure event: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
