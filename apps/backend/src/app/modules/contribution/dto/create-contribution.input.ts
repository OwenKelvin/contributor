import { IsNotEmpty, IsPositive, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateContributionInput {
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsNotEmpty()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsOptional()
  notes?: string;
}
