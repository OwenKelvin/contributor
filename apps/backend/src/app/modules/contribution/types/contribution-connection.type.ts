import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ContributionEdge } from './contribution-edge.type';
import { PageInfo } from './page-info.type';

@ObjectType()
export class ContributionConnection {
  @Field(() => [ContributionEdge])
  edges: ContributionEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;

  @Field(() => Float)
  totalAmount: number;
}
