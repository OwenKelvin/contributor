import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class TimeSeriesPoint {
  @Field()
  date: string;

  @Field(() => Int)
  contributionCount: number;

  @Field(() => Float)
  totalAmount: number;
}
