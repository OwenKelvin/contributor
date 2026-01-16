import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ProjectContributionSummary } from './project-contribution-summary.type';
import { UserContributionSummary } from './user-contribution-summary.type';
import { TimeSeriesPoint } from './time-series-point.type';

@ObjectType()
export class ContributionReport {
  @Field(() => Int)
  totalContributions: number;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Int)
  pendingCount: number;

  @Field(() => Float)
  pendingAmount: number;

  @Field(() => Int)
  paidCount: number;

  @Field(() => Float)
  paidAmount: number;

  @Field(() => Int)
  failedCount: number;

  @Field(() => Float)
  failedAmount: number;

  @Field(() => Int)
  refundedCount: number;

  @Field(() => Float)
  refundedAmount: number;

  @Field(() => Float)
  successRate: number;

  @Field(() => [ProjectContributionSummary])
  topProjects: ProjectContributionSummary[];

  @Field(() => [UserContributionSummary])
  topContributors: UserContributionSummary[];

  @Field(() => [TimeSeriesPoint])
  timeSeriesData: TimeSeriesPoint[];
}
