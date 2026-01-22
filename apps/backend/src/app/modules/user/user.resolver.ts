import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from './user.service';
import { User } from './user.model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserFilter } from './dto/user-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { BulkUpdateUserInput } from './dto/bulk-update-user.input';
import { UserConnection } from './types/user-connection.type';
import { BulkUpdateResult } from './types/bulk-update-result.type';
import { BanUserInput } from './dto/ban-user.input';

import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => UserConnection)
  async getAllUsers(
    @Args('search', { nullable: true }) search?: string,
    @Args('filter', { nullable: true }) filter?: UserFilter,
    @Args('sortBy', { nullable: true }) sortBy?: string,
    @Args('sortOrder', { nullable: true }) sortOrder?: 'ASC' | 'DESC',
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<UserConnection> {
    return this.userService.getAllUsers(search, filter, sortBy, sortOrder, pagination);
  }

  @Query(() => User)
  async getUserById(@Args('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserConnection)
  async getBannedUsers(
    @Args('search', { nullable: true }) search?: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<UserConnection> {
    return this.userService.getBannedUsers(search, pagination);
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput, @CurrentUser() user: any): Promise<User> {
    return this.userService.createUser(input, user?.id);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
    @CurrentUser() user: any,
  ): Promise<User> {
    return this.userService.updateUser(id, input, user?.id);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: string, @CurrentUser() user: any): Promise<boolean> {
    return this.userService.deleteUser(id, user?.id);
  }

  @Mutation(() => BulkUpdateResult)
  async bulkUpdateUsers(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('input') input: BulkUpdateUserInput,
  ): Promise<BulkUpdateResult> {
    return this.userService.bulkUpdateUsers(ids, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async banUser(
    @Args('input') input: BanUserInput,
    @CurrentUser() context: any,
  ): Promise<User | undefined> {
    const adminId = context.req.user.id;
    return this.userService.banUser(input.userId, adminId, input.reason);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async unbanUser(@Args('id') id: string, @CurrentUser() context: any): Promise<User | undefined> {
    const adminId = context.req.user.id;
    return this.userService.unbanUser(id, adminId);
  }
}
