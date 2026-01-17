import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TransactionType, TransactionStatus } from '../transaction.model';

export class TransactionFilterInput {
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsUUID()
  contributionId?: string;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  search?: string;
}
