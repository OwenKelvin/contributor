import { Injectable, Logger } from '@nestjs/common';
import {
  PaymentGateway,
  PaymentDetails,
  PaymentResult,
  RefundResult,
  PaymentStatusResult,
} from '../interfaces/payment-gateway.interface';
import { MpesaAuthService } from './services/mpesa-auth.service';
import { MpesaStkService } from './services/mpesa-stk.service';
import { MpesaQueryService } from './services/mpesa-query.service';
import { MpesaReversalService } from './services/mpesa-reversal.service';

/**
 * M-Pesa Payment Gateway Service
 * Implements the PaymentGateway interface using M-Pesa Daraja API
 */
@Injectable()
export class MpesaPaymentGatewayService implements PaymentGateway {
  private readonly logger = new Logger(MpesaPaymentGatewayService.name);

  constructor(
    private readonly authService: MpesaAuthService,
    private readonly stkService: MpesaStkService,
    private readonly queryService: MpesaQueryService,
    private readonly reversalService: MpesaReversalService
  ) {}

  /**
   * Process a payment using M-Pesa STK Push
   * @param contributionId - The contribution ID (used as account reference)
   * @param paymentDetails - Payment details including amount and phone number
   * @returns Payment result with checkout request ID for tracking
   */
  async processPayment(
    contributionId: string,
    paymentDetails: PaymentDetails
  ): Promise<PaymentResult> {
    try {
      this.logger.log(
        `Processing payment for contribution ${contributionId}, amount ${paymentDetails.amount}`
      );

      // Initiate STK Push
      const stkResponse = await this.stkService.initiateStkPush({
        ...paymentDetails,
        accountReference: contributionId,
      });

      // Map M-Pesa response to standard PaymentResult
      const result: PaymentResult = {
        success: stkResponse.ResponseCode === '0',
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
        responseCode: stkResponse.ResponseCode,
        responseDescription: stkResponse.ResponseDescription,
        customerMessage: stkResponse.CustomerMessage,
        errorCode: stkResponse.errorCode,
        errorMessage: stkResponse.errorMessage,
      };

      if (result.success) {
        this.logger.log(
          `Payment initiated successfully for contribution ${contributionId}. CheckoutRequestID: ${result.checkoutRequestId}`
        );
      } else {
        this.logger.warn(
          `Payment initiation failed for contribution ${contributionId}. Error: ${result.errorMessage || result.responseDescription}`
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error processing payment for contribution ${contributionId}`,
        error
      );

      return {
        success: false,
        errorCode: 'PAYMENT_ERROR',
        errorMessage: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Process a refund using M-Pesa reversal API
   * @param contributionId - The contribution ID
   * @param amount - The amount to refund
   * @param originalTransactionId - The original M-Pesa receipt number
   * @param reason - Reason for the refund
   * @returns Refund result
   */
  async processRefund(
    contributionId: string,
    amount: number,
    originalTransactionId: string,
    reason: string
  ): Promise<RefundResult> {
    try {
      this.logger.log(
        `Processing refund for contribution ${contributionId}, amount ${amount}, transaction ${originalTransactionId}`
      );

      // Initiate reversal
      const reversalResponse = await this.reversalService.initiateReversal(
        originalTransactionId,
        amount,
        reason
      );

      // Map M-Pesa response to standard RefundResult
      const result: RefundResult = {
        success: reversalResponse.ResponseCode === '0',
        conversationId: reversalResponse.ConversationID,
        originatorConversationId: reversalResponse.OriginatorConversationID,
        responseCode: reversalResponse.ResponseCode,
        responseDescription: reversalResponse.ResponseDescription,
        errorCode: reversalResponse.errorCode,
        errorMessage: reversalResponse.errorMessage,
      };

      if (result.success) {
        this.logger.log(
          `Refund initiated successfully for contribution ${contributionId}. ConversationID: ${result.conversationId}`
        );
      } else {
        this.logger.warn(
          `Refund initiation failed for contribution ${contributionId}. Error: ${result.errorMessage || result.responseDescription}`
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error processing refund for contribution ${contributionId}`,
        error
      );

      return {
        success: false,
        errorCode: 'REFUND_ERROR',
        errorMessage: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Check payment status using M-Pesa query API
   * @param checkoutRequestId - The checkout request ID from STK push
   * @returns Payment status result
   */
  async checkPaymentStatus(
    checkoutRequestId: string
  ): Promise<PaymentStatusResult> {
    try {
      this.logger.log(
        `Checking payment status for CheckoutRequestID: ${checkoutRequestId}`
      );

      // Query transaction status
      const queryResponse =
        await this.queryService.queryTransactionStatus(checkoutRequestId);

      // Map M-Pesa response to standard PaymentStatusResult
      const result: PaymentStatusResult = {
        success: queryResponse.ResponseCode === '0',
        resultCode: queryResponse.ResultCode,
        resultDesc: queryResponse.ResultDesc,
        checkoutRequestId: queryResponse.CheckoutRequestID,
        merchantRequestId: queryResponse.MerchantRequestID,
        errorCode: queryResponse.errorCode,
        errorMessage: queryResponse.errorMessage,
      };

      // Parse additional details if available
      // Note: The query response doesn't include all transaction details
      // Those are only available in the callback

      return result;
    } catch (error) {
      this.logger.error(
        `Error checking payment status for ${checkoutRequestId}`,
        error
      );

      return {
        success: false,
        errorCode: 'QUERY_ERROR',
        errorMessage: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Extract error message from various error types
   */
  private getErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unknown error occurred';
  }

  /**
   * Map M-Pesa error codes to user-friendly messages
   * Reference: https://developer.safaricom.co.ke/docs#response-codes
   */
  private mapErrorCode(errorCode: string): string {
    const errorMap: Record<string, string> = {
      '1': 'Insufficient balance',
      '2': 'Less than minimum transaction value',
      '3': 'More than maximum transaction value',
      '4': 'Would exceed daily transfer limit',
      '5': 'Would exceed minimum balance',
      '6': 'Unresolved primary party',
      '7': 'Unresolved receiver party',
      '8': 'Would exceed maximum balance',
      '11': 'Debit account invalid',
      '12': 'Credit account invalid',
      '13': 'Unresolved debit account',
      '14': 'Unresolved credit account',
      '15': 'Duplicate detected',
      '17': 'Internal failure',
      '20': 'Unresolved initiator',
      '26': 'Traffic blocking condition in place',
      '1032': 'Request cancelled by user',
      '1037': 'DS timeout user cannot be reached',
      '2001': 'Wrong PIN entered',
      '4001': 'Transaction failed',
    };

    return errorMap[errorCode] || `Error code: ${errorCode}`;
  }
}
