import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TransactionType, TransactionStatus } from '../transaction.model';

@InputType()
export class TransactionFilterInput {
  @Field(() => TransactionType, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @Field(() => TransactionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  contributionId?: string;

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;
}
