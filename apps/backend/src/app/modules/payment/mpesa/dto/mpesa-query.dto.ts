/**
 * M-Pesa Transaction Status Query Request DTO
 */
export class MpesaQueryRequestDto {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  CheckoutRequestID: string;
}

/**
 * M-Pesa Transaction Status Query Response DTO
 */
export class MpesaQueryResponseDto {
  ResponseCode?: string;
  ResponseDescription?: string;
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResultCode?: string;
  ResultDesc?: string;
  errorCode?: string;
  errorMessage?: string;
  requestId?: string;
}
