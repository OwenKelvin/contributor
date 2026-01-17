import { IsOptional, IsUUID, IsEnum, IsPositive, IsDateString } from 'class-validator';
import { PaymentStatus } from '../contribution.model';

export class ContributionFilter {
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsPositive()
  minAmount?: number;

  @IsOptional()
  @IsPositive()
  maxAmount?: number;

  @IsOptional()
  search?: string;
}
