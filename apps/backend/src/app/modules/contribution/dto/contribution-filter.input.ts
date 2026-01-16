import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsEnum, IsPositive, IsDateString } from 'class-validator';
import { PaymentStatus } from '../contribution.model';

@InputType()
export class ContributionFilter {
  @Field(() => PaymentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  minAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsPositive()
  maxAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;
}
