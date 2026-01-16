/**
 * M-Pesa Callback Metadata Item
 */
export interface CallbackMetadataItem {
  Name: string;
  Value: string | number;
}

/**
 * M-Pesa Callback Metadata
 */
export interface CallbackMetadata {
  Item: CallbackMetadataItem[];
}

/**
 * M-Pesa STK Callback Body
 */
export interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: CallbackMetadata;
}

/**
 * M-Pesa Callback Request DTO
 */
export class MpesaCallbackDto {
  Body: {
    stkCallback: StkCallback;
  };
}

/**
 * Parsed M-Pesa Callback Data
 * Extracted from the callback metadata
 */
export interface ParsedCallbackData {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
}
