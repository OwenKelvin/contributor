import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../user/user.model';
import { Project, ProjectStatus } from '../project/project.model';
import { Contribution, PaymentStatus } from '../contribution/contribution.model';
import { Transaction } from '../contribution/transaction.model';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(Contribution)
    private contributionModel: typeof Contribution,
    @InjectModel(Transaction)
    private transactionModel: typeof Transaction,
  ) {}

  async getDashboardStats(startDate?: Date, endDate?: Date, userId?: string, projectId?: string) {
    const commonFilter = this.buildCombinedFilter(startDate, endDate);

    const [
      totalUsers,
      totalProjects,
      totalContributions,
      totalRevenue,
      pendingContributions,
      pendingContributionsAmount,
      activeProjects,
      projectsByStatus,
      contributionsByStatus,
    ] = await Promise.all([
      // Total Users: Filter by userId if provided
      this.userModel.count({ where: { ...commonFilter, ...(userId && { id: userId }) } }),

      // Total Projects: Filter by projectId if provided
      this.projectModel.count({ where: { ...commonFilter, ...(projectId && { id: projectId }) } }),

      // Total Contributions: Filter by both userId and projectId if provided
      this.contributionModel.count({
        where: {
          ...commonFilter,
          ...(userId && { userId }),
          ...(projectId && { projectId }),
        },
      }),

      // Total Revenue: Filter by both userId and projectId if provided
      this.getTotalRevenue({ ...commonFilter, ...(userId && { userId }), ...(projectId && { projectId }) }),

      // Pending Contributions: Filter by both userId and projectId if provided
      this.contributionModel.count({
        where: {
          ...commonFilter,
          paymentStatus: PaymentStatus.Pending,
          ...(userId && { userId }),
          ...(projectId && { projectId }),
        },
      }),

      // Pending Contributions Amount: Filter by both userId and projectId if provided
      this.getPendingContributionsAmount({ ...commonFilter, ...(userId && { userId }), ...(projectId && { projectId }) }),

      // Active Projects: Filter by projectId if provided
      this.projectModel.count({
        where: { ...commonFilter, status: ProjectStatus.Active, ...(projectId && { id: projectId }) },
      }),

      // Projects By Status: Filter by projectId if provided
      this.getProjectsByStatus({ ...commonFilter, ...(projectId && { id: projectId }) }),

      // Contributions By Status: Filter by both userId and projectId if provided
      this.getContributionsByStatus({ ...commonFilter, ...(userId && { userId }), ...(projectId && { projectId }) }),
    ]);

    return {
      totalUsers,
      totalProjects,
      totalContributions,
      totalRevenue,
      pendingContributions,
      pendingContributionsAmount,
      activeProjects,
      projectsByStatus,
      contributionsByStatus,
    };
  }

  async getContributionTrends(
    startDate: Date,
    endDate: Date,
    groupBy: string = 'day',
    userId?: string, // Add userId filter here
    projectId?: string, // Add projectId filter here
  ) {
    const trendFilter = this.buildCombinedFilter(startDate, endDate, userId, projectId);

    const contributions = await this.contributionModel.findAll({
      where: {
        ...trendFilter,
        paymentStatus: PaymentStatus.Paid,
      },
      attributes: ['createdAt', 'amount'],
      order: [['createdAt', 'ASC']],
    });

    // Group by date
    const grouped = contributions.reduce((acc: any, contribution) => {
      const date = new Date(contribution.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      acc[date].amount += parseFloat(contribution.amount.toString());
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  async getTopProjects(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
    userId?: string, // Add userId filter here
  ) {
    const topProjectsFilter = this.buildCombinedFilter(startDate, endDate, userId);

    const contributions = await this.contributionModel.findAll({
      where: {
        ...topProjectsFilter,
        paymentStatus: PaymentStatus.Paid,
      },
      include: [
        {
          model: Project,
          as: 'project',
        },
      ],
    });

    // Group by project
    const projectMap = new Map();
    contributions.forEach((contribution) => {
      const projectId = contribution.projectId;
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          project: contribution.project,
          totalAmount: 0,
          contributionCount: 0,
        });
      }
      const data = projectMap.get(projectId);
      data.totalAmount += parseFloat(contribution.amount.toString());
      data.contributionCount += 1;
    });

    // Sort and limit
    return Array.from(projectMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);
  }

  private async getTotalRevenue(filter: any): Promise<number> {
    const result = await this.contributionModel.sum('amount', {
      where: {
        ...filter,
        paymentStatus: PaymentStatus.Paid,
      },
    });
    return result || 0;
  }

  private async getPendingContributionsAmount(filter: any): Promise<number> {
    const result = await this.contributionModel.sum('amount', {
      where: {
        ...filter,
        paymentStatus: PaymentStatus.Pending,
      },
    });
    return result || 0;
  }

  private async getProjectsByStatus(filter: any) {
    const statuses = Object.values(ProjectStatus);
    const results = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.projectModel.count({
          where: { ...filter, status },
        }),
      })),
    );
    return results.filter((r) => r.count > 0);
  }

  private async getContributionsByStatus(filter: any) {
    const statuses = Object.values(PaymentStatus);
    const results = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.contributionModel.count({
          where: { ...filter, paymentStatus: status },
        });
        const amount = await this.contributionModel.sum('amount', {
          where: { ...filter, paymentStatus: status },
        });
        return {
          status,
          count,
          amount: amount || 0,
        };
      }),
    );
    return results.filter((r) => r.count > 0);
  }

  private buildCombinedFilter(startDate?: Date, endDate?: Date, userId?: string, projectId?: string) {
    const filter: any = {};

    if (startDate && endDate) {
      filter.createdAt = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      filter.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      filter.createdAt = { [Op.lte]: endDate };
    }

    if (userId) {
      filter.userId = userId;
    }

    if (projectId) {
      filter.projectId = projectId;
    }
    return filter;
  }
}
