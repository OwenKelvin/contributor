import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { Role } from '../role/role.model';
import { UserRole } from '../role/user-role.model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserFilter } from './dto/user-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { BulkUpdateUserInput } from './dto/bulk-update-user.input';
import { UserConnection } from './types/user-connection.type';
import { BulkUpdateResult } from './types/bulk-update-result.type';
import { PageInfo } from '../../common/types/page-info.type';
import { Op } from 'sequelize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserRole)
    private userRoleModel: typeof UserRole,
    @InjectModel(Role)
    private roleModel: typeof Role,
  ) {}

  async create(userData: Partial<User> & { roles?: Role[] }): Promise<User> {
    const user = await this.userModel.create(userData as User);

    if (userData.roles && userData.roles.length > 0) {
      await user.$set('roles', userData.roles);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
    });
  }

  async getAllUsers(
    search?: string,
    filter?: UserFilter,
    pagination?: PaginationInput,
  ): Promise<UserConnection> {
    const where: any = {};

    // Apply search
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Apply filters
    const include: any[] = [
      {
        model: Role,
        through: { attributes: [] },
      },
    ];

    if (filter?.roleId) {
      include[0].where = { id: filter.roleId };
      include[0].required = true;
    }

    // Apply pagination
    const limit = pagination?.first || 20;
    const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString('ascii')) + 1 : 0;

    const { rows: users, count } = await this.userModel.findAndCountAll({
      where,
      include,
      limit: limit + 1, // Fetch one extra to check if there's a next page
      offset,
      order: [['createdAt', 'DESC']],
    });

    const hasNextPage = users.length > limit;
    const hasPreviousPage = offset > 0;

    // Remove the extra item if it exists
    if (hasNextPage) {
      users.pop();
    }

    const edges = users.map((user, index) => ({
      node: user,
      cursor: Buffer.from((offset + index).toString()).toString('base64'),
    }));

    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    };

    return {
      edges,
      pageInfo,
      totalCount: count,
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(input.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.userModel.create({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
    } as any);

    // Assign roles if provided
    if (input.roleIds && input.roleIds.length > 0) {
      const roles = await this.roleModel.findAll({
        where: { id: input.roleIds },
      });
      await user.$set('roles', roles);
    }

    return this.getUserById(user.id);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.getUserById(id);

    // Check if email is being changed and if it's already taken
    if (input.email && input.email !== user.email) {
      const existingUser = await this.findByEmail(input.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    }

    // Update basic fields
    const updateData: any = {};
    if (input.email !== undefined) updateData.email = input.email;
    if (input.password !== undefined) updateData.password = input.password;
    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;

    await user.update(updateData);

    // Update roles if provided
    if (input.roleIds !== undefined) {
      if (input.roleIds.length > 0) {
        const roles = await this.roleModel.findAll({
          where: { id: input.roleIds },
        });
        await user.$set('roles', roles);
      } else {
        await user.$set('roles', []);
      }
    }

    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.getUserById(id);
    await user.destroy();
    return true;
  }

  async bulkUpdateUsers(ids: string[], input: BulkUpdateUserInput): Promise<BulkUpdateResult> {
    const errors: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const id of ids) {
      try {
        const user = await this.getUserById(id);

        // Update roles if provided
        if (input.roleIds !== undefined) {
          if (input.roleIds.length > 0) {
            const roles = await this.roleModel.findAll({
              where: { id: input.roleIds },
            });
            await user.$set('roles', roles);
          } else {
            await user.$set('roles', []);
          }
        }

        successCount++;
      } catch (error) {
        failureCount++;
        errors.push(`Failed to update user ${id}: ${error.message}`);
      }
    }

    return {
      successCount,
      failureCount,
      errors,
    };
  }

  async banUser(id: string, reason?: string): Promise<User> {
    const user = await this.getUserById(id);
    // TODO: Implement ban logic (add isBanned field to model)
    // For now, just return the user
    return user;
  }

  async unbanUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    // TODO: Implement unban logic
    return user;
  }

  async getBannedUsers(pagination?: PaginationInput): Promise<UserConnection> {
    // TODO: Implement banned users filter when isBanned field is added
    return this.getAllUsers(undefined, undefined, pagination);
  }
}
