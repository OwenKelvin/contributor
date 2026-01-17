import { IsNotEmpty, IsPositive, IsOptional, IsUUID, Min, IsEnum } from 'class-validator';
import { PaymentStatus } from '../contribution.model';

export class AdminCreateContributionInput {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsNotEmpty()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsOptional()
  notes?: string;

  @IsOptional()
  paymentReference?: string;
}
