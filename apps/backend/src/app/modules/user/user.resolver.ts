import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserFilter } from './dto/user-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { BulkUpdateUserInput } from './dto/bulk-update-user.input';
import { UserConnection } from './types/user-connection.type';
import { BulkUpdateResult } from './types/bulk-update-result.type';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => UserConnection)
  async getAllUsers(
    @Args('search', { nullable: true }) search?: string,
    @Args('filter', { nullable: true }) filter?: UserFilter,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<UserConnection> {
    return this.userService.getAllUsers(search, filter, pagination);
  }

  @Query(() => User)
  async getUserById(@Args('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Query(() => UserConnection)
  async getBannedUsers(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<UserConnection> {
    return this.userService.getBannedUsers(pagination);
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.userService.createUser(input);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<User> {
    return this.userService.updateUser(id, input);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    return this.userService.deleteUser(id);
  }

  @Mutation(() => BulkUpdateResult)
  async bulkUpdateUsers(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('input') input: BulkUpdateUserInput,
  ): Promise<BulkUpdateResult> {
    return this.userService.bulkUpdateUsers(ids, input);
  }

  @Mutation(() => User)
  async banUser(
    @Args('id') id: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<User> {
    return this.userService.banUser(id, reason);
  }

  @Mutation(() => User)
  async unbanUser(@Args('id') id: string): Promise<User> {
    return this.userService.unbanUser(id);
  }
}
