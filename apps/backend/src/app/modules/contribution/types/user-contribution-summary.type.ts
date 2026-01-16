import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';

@ObjectType()
export class UserContributionSummary {
  @Field(() => ID)
  userId: string;

  @Field()
  userName: string;

  @Field()
  userEmail: string;

  @Field(() => Int)
  contributionCount: number;

  @Field(() => Float)
  totalAmount: number;
}
