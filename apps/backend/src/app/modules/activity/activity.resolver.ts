import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ActivityService } from './activity.service';
import { Activity } from './activity.model';
import { CreateActivityInput } from './dto/create-activity.input';
import { ActivityFilter } from './dto/activity-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { ActivityConnection } from './types/activity-connection.type';

@Resolver('Activity')
export class ActivityResolver {
  constructor(private activityService: ActivityService) {}

  @Query('activities')
  async activities(
    @Args('filter') filter?: ActivityFilter,
    @Args('pagination') pagination?: PaginationInput,
  ): Promise<ActivityConnection> {
    return this.activityService.getActivities(filter, pagination);
  }

  @Query('activity')
  async activity(@Args('id') id: string): Promise<Activity | null> {
    return this.activityService.getActivityById(id);
  }

  @Mutation('logActivity')
  async logActivity(@Args('input') input: CreateActivityInput): Promise<Activity> {
    return this.activityService.logActivity(input);
  }
}
