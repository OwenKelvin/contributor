import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BulkUpdateResult {
  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => [String])
  errors: string[];
}
