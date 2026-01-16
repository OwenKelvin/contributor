import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsEnum } from 'class-validator';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

@InputType()
export class PaymentDetailsInput {
  @Field(() => PaymentMethod)
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field()
  @IsNotEmpty()
  paymentToken: string;
}
