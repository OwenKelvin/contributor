import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  DashboardStats,
  ContributionTrend,
  TopProject,
} from './types/dashboard-stats.type';
import { RoleList } from '../role/role-list';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => DashboardStats)
  @Roles(RoleList.Admin)
  async dashboardStats(
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
  ) {
    return this.dashboardService.getDashboardStats(startDate, endDate, userId, projectId);
  }

  @Query(() => [ContributionTrend])
  @Roles(RoleList.Admin)
  async contributionTrends(
    @Args('startDate', { type: () => Date }) startDate: Date,
    @Args('endDate', { type: () => Date }) endDate: Date,
    @Args('groupBy', { type: () => String, nullable: true, defaultValue: 'day' })
    groupBy?: string,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
  ) {
    return this.dashboardService.getContributionTrends(
      startDate,
      endDate,
      groupBy,
      userId,
      projectId,
    );
  }

  @Query(() => [TopProject])
  @Roles(RoleList.Admin)
  async topProjects(
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 10 })
    limit?: number,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
  ) {
    return this.dashboardService.getTopProjects(limit, startDate, endDate, userId);
  }
}
