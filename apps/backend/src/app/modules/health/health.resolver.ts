import { Resolver, Query } from '@nestjs/graphql';
import { HealthService } from './health.service';
import { HealthCheck } from './types/health.type';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleList } from '../role/role-list';

@Resolver(() => HealthCheck)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(RoleList.Admin)
export class HealthResolver {
  constructor(private healthService: HealthService) {}

  @Query(() => [HealthCheck])
  async healthChecks(): Promise<HealthCheck[]> {
    return this.healthService.checkHealth();
  }
}
