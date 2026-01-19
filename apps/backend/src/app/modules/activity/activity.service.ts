import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Activity } from './activity.model';
import { CreateActivityInput } from './dto/create-activity.input';
import { ActivityFilter } from './dto/activity-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { ActivityConnection } from './types/activity-connection.type';
import { PageInfo } from '../../common/types/page-info.type';
import { Op } from 'sequelize';
import { User } from '../user/user.model';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity)
    private activityModel: typeof Activity,
  ) {}

  async logActivity(data: CreateActivityInput): Promise<Activity> {
    const activity = await this.activityModel.create({
      userId: data.userId,
      action: data.action,
      targetId: data.targetId || null,
      targetType: data.targetType || null,
      details: data.details || '{}',
    });

    const result = await this.activityModel.findByPk(activity.id, {
      include: [User],
    });

    if (!result) {
      throw new Error('Failed to retrieve created activity');
    }

    return result;
  }

  async getActivities(
    filter?: ActivityFilter,
    pagination?: PaginationInput,
  ): Promise<ActivityConnection> {
    const where: Record<string, unknown> = {};

    // Apply filters
    if (filter?.userId) {
      where.userId = filter.userId;
    }

    if (filter?.action) {
      where.action = filter.action;
    }

    if (filter?.targetType) {
      where.targetType = filter.targetType;
    }

    if (filter?.dateRange) {
      where.createdAt = {
        [Op.gte]: filter.dateRange.start,
        [Op.lte]: filter.dateRange.end,
      };
    }

    // Apply pagination
    const limit = pagination?.first || 20;
    const offset = pagination?.after
      ? parseInt(Buffer.from(pagination.after, 'base64').toString('ascii')) + 1
      : 0;

    const { rows: activities, count } = await this.activityModel.findAndCountAll({
      where,
      include: [User],
      limit: limit + 1, // Fetch one extra to check if there's a next page
      offset,
      order: [['createdAt', 'DESC']],
    });

    const hasNextPage = activities.length > limit;
    const hasPreviousPage = offset > 0;

    // Remove the extra item if it exists
    if (hasNextPage) {
      activities.pop();
    }

    const edges = activities.map((activity, index) => ({
      node: activity,
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

  async getActivityById(id: string): Promise<Activity | null> {
    return this.activityModel.findByPk(id, {
      include: [User],
    });
  }
}
