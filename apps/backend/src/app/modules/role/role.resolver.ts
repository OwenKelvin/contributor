import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { RoleService } from './role.service';
import { Role } from './role.model';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Role)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Mutation(() => Role)
  async createRole(
    @Args('name') name: string,
    @CurrentUser() user: any,
  ): Promise<Role> {
    return this.roleService.create(name, user.id);
  }

  @Mutation(() => Role)
  async updateRole(
    @Args('id') id: string,
    @Args('name') name: string,
    @CurrentUser() user: any,
  ): Promise<Role> {
    return this.roleService.update(id, name, user.id);
  }

  @Mutation(() => Boolean)
  async deleteRole(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.roleService.delete(id, user.id);
  }
}
