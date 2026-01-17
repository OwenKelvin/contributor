import { IsNotEmpty, IsPhoneNumber, IsOptional } from 'class-validator';

export class PaymentDetailsInput {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  accountReference: string;

  @IsOptional()
  transactionDesc?: string;
}
