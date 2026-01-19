import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class PaginationInput {
  @IsOptional()
  @IsInt()
  @Min(1)
  first?: number;

  @IsOptional()
  @IsString()
  after?: string;
}
