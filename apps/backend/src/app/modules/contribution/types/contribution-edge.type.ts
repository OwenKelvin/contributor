import { ObjectType, Field } from '@nestjs/graphql';
import { Contribution } from '../contribution.model';

@ObjectType()
export class ContributionEdge {
  @Field(() => Contribution)
  node: Contribution;

  @Field()
  cursor: string;
}
