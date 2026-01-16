import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';

@ObjectType()
export class ProjectContributionSummary {
  @Field(() => ID)
  projectId: string;

  @Field()
  projectTitle: string;

  @Field(() => Int)
  contributionCount: number;

  @Field(() => Float)
  totalAmount: number;
}
