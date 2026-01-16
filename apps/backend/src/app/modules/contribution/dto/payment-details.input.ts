import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsPhoneNumber, IsOptional } from 'class-validator';

@InputType()
export class PaymentDetailsInput {
  @Field()
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @Field()
  @IsNotEmpty()
  accountReference: string;

  @Field({ nullable: true })
  @IsOptional()
  transactionDesc?: string;
}
