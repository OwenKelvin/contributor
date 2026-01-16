/**
 * Base payment details interface
 */
export interface PaymentDetails {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc?: string;
}

/**
 * Result of a payment processing operation
 */
export interface PaymentResult {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Result of a refund processing operation
 */
export interface RefundResult {
  success: boolean;
  conversationId?: string;
  originatorConversationId?: string;
  responseCode?: string;
  responseDescription?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Result of a payment status check
 */
export interface PaymentStatusResult {
  success: boolean;
  resultCode?: string;
  resultDesc?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
  amount?: number;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Payment Gateway interface
 * Defines the contract for payment processing services
 */
export interface PaymentGateway {
  /**
   * Process a payment
   * @param contributionId - The contribution ID
   * @param paymentDetails - Payment details including amount and phone number
   * @returns Payment result with checkout request ID for tracking
   */
  processPayment(
    contributionId: string,
    paymentDetails: PaymentDetails
  ): Promise<PaymentResult>;

  /**
   * Process a refund
   * @param contributionId - The contribution ID
   * @param amount - The amount to refund
   * @param originalTransactionId - The original M-Pesa receipt number
   * @param reason - Reason for the refund
   * @returns Refund result
   */
  processRefund(
    contributionId: string,
    amount: number,
    originalTransactionId: string,
    reason: string
  ): Promise<RefundResult>;

  /**
   * Check payment status
   * @param checkoutRequestId - The checkout request ID from STK push
   * @returns Payment status result
   */
  checkPaymentStatus(
    checkoutRequestId: string
  ): Promise<PaymentStatusResult>;
}
