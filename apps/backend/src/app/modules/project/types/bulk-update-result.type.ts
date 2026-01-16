import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType('ProjectBulkUpdateResult')
export class BulkUpdateResult {
  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => [String])
  errors: string[];
}
