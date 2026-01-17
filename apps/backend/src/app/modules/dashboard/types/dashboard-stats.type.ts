import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ProjectStatusCount {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class ContributionStatusCount {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  amount: number;
}

@ObjectType()
export class DashboardStats {
  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  totalProjects: number;

  @Field(() => Int)
  totalContributions: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  pendingContributions: number;

  @Field(() => Float)
  pendingContributionsAmount: number;

  @Field(() => Int)
  activeProjects: number;

  @Field(() => [ProjectStatusCount])
  projectsByStatus: ProjectStatusCount[];

  @Field(() => [ContributionStatusCount])
  contributionsByStatus: ContributionStatusCount[];
}

@ObjectType()
export class ContributionTrend {
  @Field()
  date: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class TopProject {
  @Field(() => Object)
  project: any;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Int)
  contributionCount: number;
}
