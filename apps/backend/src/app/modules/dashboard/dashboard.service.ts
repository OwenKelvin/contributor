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

  async getDashboardStats(startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

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
      this.userModel.count({ where: dateFilter }),
      this.projectModel.count({ where: dateFilter }),
      this.contributionModel.count({ where: dateFilter }),
      this.getTotalRevenue(dateFilter),
      this.contributionModel.count({
        where: { ...dateFilter, paymentStatus: PaymentStatus.PENDING },
      }),
      this.getPendingContributionsAmount(dateFilter),
      this.projectModel.count({
        where: { ...dateFilter, status: ProjectStatus.ACTIVE },
      }),
      this.getProjectsByStatus(dateFilter),
      this.getContributionsByStatus(dateFilter),
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
  ) {
    const contributions = await this.contributionModel.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
        paymentStatus: PaymentStatus.PAID,
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

  async getTopProjects(limit: number = 10, startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const contributions = await this.contributionModel.findAll({
      where: {
        ...dateFilter,
        paymentStatus: PaymentStatus.PAID,
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

  private async getTotalRevenue(dateFilter: any): Promise<number> {
    const result = await this.contributionModel.sum('amount', {
      where: {
        ...dateFilter,
        paymentStatus: PaymentStatus.PAID,
      },
    });
    return result || 0;
  }

  private async getPendingContributionsAmount(dateFilter: any): Promise<number> {
    const result = await this.contributionModel.sum('amount', {
      where: {
        ...dateFilter,
        paymentStatus: PaymentStatus.PENDING,
      },
    });
    return result || 0;
  }

  private async getProjectsByStatus(dateFilter: any) {
    const statuses = Object.values(ProjectStatus);
    const results = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.projectModel.count({
          where: { ...dateFilter, status },
        }),
      })),
    );
    return results.filter((r) => r.count > 0);
  }

  private async getContributionsByStatus(dateFilter: any) {
    const statuses = Object.values(PaymentStatus);
    const results = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.contributionModel.count({
          where: { ...dateFilter, paymentStatus: status },
        });
        const amount = await this.contributionModel.sum('amount', {
          where: { ...dateFilter, paymentStatus: status },
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

  private buildDateFilter(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) {
      return {};
    }

    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      filter.createdAt = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      filter.createdAt = {
        [Op.lte]: endDate,
      };
    }
    return filter;
  }
}
