import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PermissionService } from './permission.service';
import { Permission } from './permission.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Permission)
export class PermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}

  @Mutation(() => Permission)
  async createPermission(
    @Args('name') name: string,
    @CurrentUser() user: any,
  ): Promise<Permission> {
    return this.permissionService.create(name, user.id);
  }

  @Mutation(() => Permission)
  async updatePermission(
    @Args('id') id: string,
    @Args('name') name: string,
    @CurrentUser() user: any,
  ): Promise<Permission> {
    return this.permissionService.update(id, name, user.id);
  }

  @Mutation(() => Boolean)
  async deletePermission(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.permissionService.delete(id, user.id);
  }
}
