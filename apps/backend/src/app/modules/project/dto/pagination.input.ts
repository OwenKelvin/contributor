import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field({ nullable: true })
  cursor?: string;

  @Field(() => Int)
  limit: number;
}
