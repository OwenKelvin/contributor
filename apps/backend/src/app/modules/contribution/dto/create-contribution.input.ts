import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsPositive, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateContributionInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;
}
