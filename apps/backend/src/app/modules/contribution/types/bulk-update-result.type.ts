import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BulkUpdateError {
  @Field()
  contributionId: string;

  @Field()
  error: string;
}

@ObjectType('ContributionBulkUpdateResult')
export class BulkUpdateResult {
  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => [BulkUpdateError])
  errors: BulkUpdateError[];
}
