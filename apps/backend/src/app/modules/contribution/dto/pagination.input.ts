import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsPositive, IsInt } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  first?: number;

  @Field({ nullable: true })
  @IsOptional()
  after?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  last?: number;

  @Field({ nullable: true })
  @IsOptional()
  before?: string;
}
