import { IsString, IsNumber, IsOptional, Min, Matches } from 'class-validator';
import { PaymentDetails } from '../../interfaces/payment-gateway.interface';

/**
 * M-Pesa specific payment details
 * Extends the base PaymentDetails interface
 */
export class MpesaPaymentDetailsDto implements PaymentDetails {
  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @IsString()
  @Matches(/^254\d{9}$/, {
    message: 'Phone number must be in format 254XXXXXXXXX',
  })
  phoneNumber: string;

  @IsString()
  accountReference: string;

  @IsOptional()
  @IsString()
  transactionDesc?: string;
}
