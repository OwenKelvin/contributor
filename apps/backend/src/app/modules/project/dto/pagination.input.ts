import { InputType, Field, Int } from '@nestjs/graphql';

@InputType('ProjectPaginationInput')
export class PaginationInput {
  @Field({ nullable: true })
  cursor?: string;

  @Field(() => Int)
  limit: number;
}
