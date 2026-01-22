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
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, TargetType } from '../activity/activity.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserRole)
    private userRoleModel: typeof UserRole,
    @InjectModel(Role)
    private roleModel: typeof Role,
    private activityService: ActivityService,
  ) {}

  async create(userData: Partial<User> & { roles?: Role[] }, createdByUserId?: string): Promise<User> {
    const user = await this.userModel.create(userData as User);

    if (userData.roles && userData.roles.length > 0) {
      await user.$set('roles', userData.roles);
    }
    if (createdByUserId) {
      await this.activityService.logActivity({
        userId: createdByUserId,
        action: ActivityAction.USER_CREATED,
        targetId: user.id,
        targetType: TargetType.USER,
        details: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleIds: userData.roles?.map(r => r.id),
        }),
      });
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

  async createUser(input: CreateUserInput, createdByUserId?: string): Promise<User> {
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

    // Log activity if createdByUserId is provided
    if (createdByUserId) {
      await this.activityService.logActivity({
        userId: createdByUserId,
        action: ActivityAction.USER_CREATED,
        targetId: user.id,
        targetType: TargetType.USER,
        details: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleIds: input.roleIds,
        }),
      });
    }

    return this.getUserById(user.id);
  }

  async updateUser(id: string, input: UpdateUserInput, updatedByUserId?: string): Promise<User> {
    const user = await this.getUserById(id);
    const oldEmail = user.email;

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

    // Log activity if updatedByUserId is provided
    if (updatedByUserId) {
      await this.activityService.logActivity({
        userId: updatedByUserId,
        action: ActivityAction.USER_UPDATED,
        targetId: user.id,
        targetType: TargetType.USER,
        details: JSON.stringify({
          oldEmail,
          newEmail: user.email,
          changes: input,
          updatedAt: new Date().toISOString(),
        }),
      });
    }

    return this.getUserById(id);
  }

  async deleteUser(id: string, deletedByUserId?: string): Promise<boolean> {
    const user = await this.getUserById(id);
    await user.destroy();
    if (deletedByUserId) {
      await this.activityService.logActivity({
        userId: deletedByUserId,
        action: ActivityAction.USER_DELETED,
        targetId: id,
        targetType: TargetType.USER,
        details: JSON.stringify({ email: user.email, firstName: user.firstName, lastName: user.lastName }),
      });
    }
    return true;
  }

  async bulkUpdateUsers(ids: string[], input: BulkUpdateUserInput, updatedByUserId?: string): Promise<BulkUpdateResult> {
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
        if (updatedByUserId) {
          await this.activityService.logActivity({
            userId: updatedByUserId,
            action: ActivityAction.USER_UPDATED,
            targetId: user.id,
            targetType: TargetType.USER,
            details: JSON.stringify({ changes: input, updatedAt: new Date().toISOString() }),
          });
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

  async banUser(id: string, adminId: string, reason?: string): Promise<User | undefined> {
    return this.userModel.sequelize?.transaction(async (t) => {
      const user = await this.getUserById(id);

      if (user.isBanned) {
        throw new BadRequestException(`User with ID ${id} is already banned.`);
      }

      await user.update(
        {
          isBanned: true,
          bannedAt: new Date(),
          bannedById: adminId,
          banReason: reason,
        },
        { transaction: t },
      );

      await this.activityService.logActivity(
        {
          userId: adminId,
          action: ActivityAction.USER_BANNED,
          targetId: user.id,
          targetType: TargetType.USER,
          details: JSON.stringify({
            reason,
            bannedAt: user.bannedAt,
            bannedById: adminId,
          }),
        },
        t,
      );

      return user;
    });
  }

  async unbanUser(id: string, adminId: string): Promise<User | undefined> {
    return this.userModel.sequelize?.transaction(async (t) => {
      const user = await this.getUserById(id);

      if (!user.isBanned) {
        throw new BadRequestException(`User with ID ${id} is not banned.`);
      }

      await user.update(
        {
          isBanned: false,
          bannedAt: null,
          bannedBy: null,
          banReason: null,
        },
        { transaction: t },
      );

      await this.activityService.logActivity(
        {
          userId: adminId,
          action: ActivityAction.USER_UNBANNED,
          targetId: user.id,
          targetType: TargetType.USER,
          details: JSON.stringify({
            unbannedAt: new Date().toISOString(),
            unbannedById: adminId,
          }),
        },
        t,
      );

      return user;
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userModel.findOne({
      where: {
        passwordResetToken: token,
      },
    });
  }

  async getBannedUsers(
    search?: string,
    pagination?: PaginationInput,
  ): Promise<UserConnection> {
    const filter: UserFilter = { isBanned: true };
    return this.getAllUsers(search, filter, pagination);
  }
}
