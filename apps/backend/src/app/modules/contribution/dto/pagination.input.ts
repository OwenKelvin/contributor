import { IsOptional, IsPositive, IsInt } from 'class-validator';

export class PaginationInput {
  @IsOptional()
  @IsInt()
  @IsPositive()
  first?: number;

  @IsOptional()
  after?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  last?: number;

  @IsOptional()
  before?: string;
}
