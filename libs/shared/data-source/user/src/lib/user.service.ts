import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IGetAllUsersGQL,
  IGetUserByIdGQL,
  IGetBannedUsersGQL,
  ICreateUserGQL,
  IUpdateUserGQL,
  IDeleteUserGQL,
  IBulkUpdateUsersGQL,
  IBanUserGQL,
  IUnbanUserGQL,
} from './graphql/users.generated';
import {
  ICreateUserInput,
  IUpdateUserInput,
  IUserFilter,
  IUserPaginationInput,
  IBulkUpdateUserInput,
} from '@nyots/data-source';
import { map } from 'rxjs/operators';

export interface IRole {
  id: string;
  name: string;
}

export interface BulkOperationResult {
  successCount: number;
  failureCount: number;
  failedIds: string[];
}

/**
 * Service for managing user-related GraphQL operations.
 * Follows the error handling pattern from AuthService and ProjectService.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private getAllUsersGQL = inject(IGetAllUsersGQL);
  private getUserByIdGQL = inject(IGetUserByIdGQL);
  private getBannedUsersGQL = inject(IGetBannedUsersGQL);
  private createUserGQL = inject(ICreateUserGQL);
  private updateUserGQL = inject(IUpdateUserGQL);
  private deleteUserGQL = inject(IDeleteUserGQL);
  private bulkUpdateUsersGQL = inject(IBulkUpdateUsersGQL);
  private banUserGQL = inject(IBanUserGQL);
  private unbanUserGQL = inject(IUnbanUserGQL);

  /**
   * Retrieves all roles (mocked for now).
   * @returns Array of roles
   */
  async getAllRoles(): Promise<IRole[]> {
    // In a real application, this would fetch from a GraphQL query
    return [
      { id: '1', name: 'Admin' },
      { id: '2', name: 'Editor' },
      { id: '3', name: 'Viewer' },
    ];
  }

  /**
   * Retrieves all users with optional search, filters, and pagination.
   * @param params - Query parameters including search term, filters, and pagination
   * @returns User connection with users array and page info
   */
  async getAllUsers(params: {
    search?: string;
    filters?: IUserFilter;
    pagination?: IUserPaginationInput;
  }) {
    const response = await firstValueFrom(
      this.getAllUsersGQL.fetch({
        variables: {
          search: params.search,
          filter: params.filters,
          pagination: params.pagination,
        },
      }),
    );
    return response.data?.getAllUsers;
  }

  /**
   * Retrieves a single user by ID.
   * @param id - User ID
   * @returns User details
   */
  async getUserById(id: string) {
    const response = await firstValueFrom(
      this.getUserByIdGQL.fetch({ variables: { id } }),
    );
    return response.data?.getUserById;
  }

  /**
   * Retrieves all banned users with optional pagination.
   * @param pagination - Pagination parameters
   * @returns User connection with banned users
   */
  async getBannedUsers(pagination?: IUserPaginationInput) {
    const response = await firstValueFrom(
      this.getBannedUsersGQL.fetch({ variables: { pagination } })
    );
    return response.data?.getBannedUsers;
  }

  /**
   * Creates a new user.
   * @param input - User creation input
   * @returns Created user
   */
  async createUser(input: ICreateUserInput) {
    const response = await firstValueFrom(
      this.createUserGQL.mutate({
        variables: { input },
      }),
    );
    return response.data?.createUser;
  }

  /**
   * Updates an existing user.
   * @param id - User ID
   * @param input - User update input
   * @returns Updated user
   */
  async updateUser(id: string, input: IUpdateUserInput) {
    const response = await firstValueFrom(
      this.updateUserGQL.mutate({
        variables: { id, input },
      }),
    );
    return response.data?.updateUser;
  }

  /**
   * Deletes a user.
   * @param id - User ID
   * @returns Boolean indicating success
   */
  async deleteUser(id: string) {
    const response = await firstValueFrom(
      this.deleteUserGQL.mutate({
        variables: { id },
      }),
    );
    return response.data?.deleteUser;
  }

  /**
   * Performs bulk update on multiple users.
   * @param ids - Array of user IDs
   * @param input - Bulk update input
   * @returns Bulk update result with success/failure counts
   */
  async bulkUpdateUsers(ids: string[], input: IBulkUpdateUserInput) {
    const response = await firstValueFrom(
      this.bulkUpdateUsersGQL.mutate({
        variables: { ids, input },
      }),
    );
    return response.data?.bulkUpdateUsers;
  }

  /**
   * Bans a user.
   * @param userId - User ID
   * @param reason - Optional ban reason
   * @returns Banned user
   */
  async banUser(userId: string, reason?: string) {
    const response = await firstValueFrom(
      this.banUserGQL.mutate({
        variables: { userId, reason },
      }),
    );
    return response.data?.banUser;
  }

  /**
   * Unbans a user.
   * @param id - User ID
   * @returns Unbanned user
   */
  async unbanUser(id: string) {
    const response = await firstValueFrom(
      this.unbanUserGQL.mutate({
        variables: { id },
      }),
    );
    return response.data?.unbanUser;
  }

  /**
   * Bulk assigns a role to multiple users.
   * @param userIds - Array of user IDs
   * @param roleId - ID of the role to assign
   * @returns Bulk operation result
   */
  async bulkAssignRole(userIds: string[], roleId: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      successCount: 0,
      failureCount: 0,
      failedIds: [],
    };

    // Assuming bulkUpdateUsersGQL can handle assigning roles
    // This is a simplified example; a real implementation might require a specific GraphQL mutation for bulk role assignment
    try {
      const response = await firstValueFrom(
        this.bulkUpdateUsersGQL.mutate({
          variables: {
            ids: userIds,
            input: { roleIds: [roleId] }, // Assuming roleIds can be directly updated
          },
        }),
      );
      if (response.data?.bulkUpdateUsers?.success) {
        result.successCount = userIds.length; // Assuming all succeed if no error
      } else {
        result.failureCount = userIds.length;
        result.failedIds = userIds;
      }
    } catch (error) {
      console.error('Error in bulkAssignRole:', error);
      result.failureCount = userIds.length;
      result.failedIds = userIds;
    }

    return result;
  }

  /**
   * Bulk deletes multiple users.
   * @param userIds - Array of user IDs
   * @returns Bulk operation result
   */
  async bulkDeleteUsers(userIds: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      successCount: 0,
      failureCount: 0,
      failedIds: [],
    };

    for (const id of userIds) {
      try {
        const response = await firstValueFrom(this.deleteUserGQL.mutate({ variables: { id } }));
        if (response.data?.deleteUser) { // Assuming deleteUser returns true on success
          result.successCount++;
        } else {
          result.failureCount++;
          result.failedIds.push(id);
        }
      } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        result.failureCount++;
        result.failedIds.push(id);
      }
    }
    return result;
  }

  /**
   * Bulk bans multiple users.
   * @param userIds - Array of user IDs
   * @param reason - Reason for banning
   * @returns Bulk operation result
   */
  async bulkBanUsers(userIds: string[], reason: string, adminId: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      successCount: 0,
      failureCount: 0,
      failedIds: [],
    };

    for (const id of userIds) {
      try {
        const response = await firstValueFrom(this.banUserGQL.mutate({ variables: { userId: id, reason } }));
        if (response.data?.banUser) { // Assuming banUser returns the banned user on success
          result.successCount++;
        } else {
          result.failureCount++;
          result.failedIds.push(id);
        }
      } catch (error) {
        console.error(`Error banning user ${id}:`, error);
        result.failureCount++;
        result.failedIds.push(id);
      }
    }
    return result;
  }
}
