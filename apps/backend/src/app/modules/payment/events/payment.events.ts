/**
 * Payment Success Event
 * Emitted when a payment is successfully completed
 */
export class PaymentSuccessEvent {
  constructor(
    public readonly checkoutRequestId: string,
    public readonly merchantRequestId: string,
    public readonly mpesaReceiptNumber: string,
    public readonly amount: number,
    public readonly phoneNumber: string,
    public readonly transactionDate: string,
    public readonly resultDesc: string
  ) {}
}

/**
 * Payment Failure Event
 * Emitted when a payment fails
 */
export class PaymentFailureEvent {
  constructor(
    public readonly checkoutRequestId: string,
    public readonly merchantRequestId: string,
    public readonly resultCode: number,
    public readonly resultDesc: string
  ) {}
}

/**
 * Refund Success Event
 * Emitted when a refund is successfully completed
 */
export class RefundSuccessEvent {
  constructor(
    public readonly conversationId: string,
    public readonly originatorConversationId: string,
    public readonly transactionId: string,
    public readonly resultDesc: string
  ) {}
}

/**
 * Refund Failure Event
 * Emitted when a refund fails
 */
export class RefundFailureEvent {
  constructor(
    public readonly conversationId: string,
    public readonly originatorConversationId: string,
    public readonly resultCode: number,
    public readonly resultDesc: string
  ) {}
}

/**
 * Refund Timeout Event
 * Emitted when a refund request times out
 */
export class RefundTimeoutEvent {
  constructor(
    public readonly conversationId: string,
    public readonly originatorConversationId: string
  ) {}
}

/**
 * Payment event names for use with EventEmitter2
 */
export const PAYMENT_EVENTS = {
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILURE: 'payment.failure',
  REFUND_SUCCESS: 'refund.success',
  REFUND_FAILURE: 'refund.failure',
  REFUND_TIMEOUT: 'refund.timeout',
} as const;
