import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsPositive, IsOptional, IsUUID, Min, IsEnum } from 'class-validator';
import { PaymentStatus } from '../contribution.model';

@InputType()
export class AdminCreateContributionInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @Field(() => PaymentStatus)
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  paymentReference?: string;
}
