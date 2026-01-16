import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsDateString } from 'class-validator';

@InputType()
export class ReportFilter {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
