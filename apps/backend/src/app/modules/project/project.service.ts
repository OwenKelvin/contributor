import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project, ProjectStatus } from './project.model';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { ProjectFilter } from './dto/project-filter.input';
import { ArchivedProjectFilter } from './dto/archived-project-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { BulkUpdateInput } from './dto/bulk-update.input';
import { ProjectConnection } from './types/project-connection.type';
import { PageInfo } from '../../common/types/page-info.type';
import { BulkUpdateResult } from './types/bulk-update-result.type';
import { Op } from 'sequelize';
import { Category } from '../category/category.model';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, TargetType } from '../activity/activity.model';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project)
    private projectModel: typeof Project,
    private activityService: ActivityService,
  ) {}

  async getAllProjects(
    search?: string,
    filter?: ProjectFilter,
    pagination?: PaginationInput,
  ): Promise<ProjectConnection> {
    const where: any = {};

    // Apply search
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Apply filters
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.categoryId) {
      where.categoryId = filter.categoryId;
    }
    if (filter?.dateRange) {
      where.startDate = {
        [Op.gte]: filter.dateRange.start,
        [Op.lte]: filter.dateRange.end,
      };
    }

    // Apply pagination
    const limit = pagination?.first || 20;
    const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString('ascii')) + 1 : 0;

    const { rows: projects, count } = await this.projectModel.findAndCountAll({
      where,
      include: [Category],
      limit: limit + 1, // Fetch one extra to check if there's a next page
      offset,
      order: [['createdAt', 'DESC']],
    });

    const hasNextPage = projects.length > limit;
    const hasPreviousPage = offset > 0;

    // Remove the extra item if it exists
    if (hasNextPage) {
      projects.pop();
    }

    const edges = projects.map((project, index) => ({
      node: project,
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

  async getProjectById(id: string): Promise<Project> {
    const project = await this.projectModel.findByPk(id, {
      include: [Category],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async getActiveProjects(pagination?: PaginationInput): Promise<ProjectConnection> {
    return this.getAllProjects(undefined, { status: ProjectStatus.Active }, pagination);
  }

  async getPendingProjects(pagination?: PaginationInput): Promise<ProjectConnection> {
    return this.getAllProjects(undefined, { status: ProjectStatus.Pending }, pagination);
  }

  async getArchivedProjects(
    filter?: ArchivedProjectFilter,
    pagination?: PaginationInput,
  ): Promise<ProjectConnection> {
    const where: any = { status: ProjectStatus.Archived };

    if (filter?.archivedAfter) {
      where.updatedAt = { [Op.gte]: filter.archivedAfter };
    }
    if (filter?.archivedBefore) {
      where.updatedAt = {
        ...where.updatedAt,
        [Op.lte]: filter.archivedBefore,
      };
    }

    const limit = pagination?.first || 20;
    const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString('ascii')) + 1 : 0;

    const { rows: projects, count } = await this.projectModel.findAndCountAll({
      where,
      include: [Category],
      limit: limit + 1,
      offset,
      order: [['updatedAt', 'DESC']],
    });

    const hasNextPage = projects.length > limit;
    const hasPreviousPage = offset > 0;

    if (hasNextPage) {
      projects.pop();
    }

    const edges = projects.map((project, index) => ({
        node: project,
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

  async createProject(input: CreateProjectInput, userId?: string): Promise<Project> {
    console.log({
      title: input.title,
      description: input.description,
      detailedDescription: input.detailedDescription,
      goalAmount: input.goalAmount,
      startDate: input.startDate,
      endDate: input.endDate,
      categoryId: input.categoryId,
      featuredImage: input.featuredImage,
      status: input.status,
      currentAmount: 0,
    });
    const project = await this.projectModel.create({
      title: input.title,
      description: input.description,
      detailedDescription: input.detailedDescription,
      goalAmount: input.goalAmount,
      startDate: input.startDate,
      endDate: input.endDate,
      categoryId: input.categoryId,
      featuredImage: input.featuredImage,
      status: input.status,
      currentAmount: 0,
    } as any);

    // Log activity if userId is provided
    if (userId) {
      await this.activityService.logActivity({
        userId,
        action: ActivityAction.PROJECT_CREATED,
        targetId: project.id,
        targetType: TargetType.PROJECT,
        details: JSON.stringify({
          title: project.title,
          goalAmount: project.goalAmount,
          categoryId: project.categoryId,
          status: project.status,
        }),
      });
    }

    return this.getProjectById(project.id);
  }

  async updateProject(id: string, input: UpdateProjectInput, userId?: string): Promise<Project> {
    const project = await this.getProjectById(id);
    const oldStatus = project.status;
    
    await project.update(input);

    // Log activity if userId is provided
    if (userId) {
      await this.activityService.logActivity({
        userId,
        action: ActivityAction.PROJECT_UPDATED,
        targetId: project.id,
        targetType: TargetType.PROJECT,
        details: JSON.stringify({
          title: project.title,
          changes: input,
          oldStatus,
          newStatus: project.status,
        }),
      });
    }

    return this.getProjectById(id);
  }

  async deleteProject(id: string, userId?: string): Promise<boolean> {
    const project = await this.getProjectById(id);
    const projectTitle = project.title;
    
    await project.destroy();

    // Log activity if userId is provided
    if (userId) {
      await this.activityService.logActivity({
        userId,
        action: ActivityAction.PROJECT_DELETED,
        targetId: id,
        targetType: TargetType.PROJECT,
        details: JSON.stringify({
          title: projectTitle,
          deletedAt: new Date().toISOString(),
        }),
      });
    }

    return true;
  }

  async bulkUpdateProjects(ids: string[], input: BulkUpdateInput): Promise<BulkUpdateResult> {
    const errors: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const id of ids) {
      try {
        await this.updateProject(id, input);
        successCount++;
      } catch (error) {
        failureCount++;
        errors.push(`Failed to update project ${id}: ${error.message}`);
      }
    }

    return {
      successCount,
      failureCount,
      errors,
    };
  }

  async approveProject(id: string, notes?: string, userId?: string): Promise<Project> {
    const project = await this.getProjectById(id);

    if (project.status !== ProjectStatus.Pending) {
      throw new Error('Only pending projects can be approved');
    }

    await project.update({
      status: ProjectStatus.Active,
      // TODO: Store approval notes if needed
    });

    // Log activity if userId is provided
    if (userId) {
      await this.activityService.logActivity({
        userId,
        action: ActivityAction.PROJECT_APPROVED,
        targetId: project.id,
        targetType: TargetType.PROJECT,
        details: JSON.stringify({
          title: project.title,
          notes,
          approvedAt: new Date().toISOString(),
        }),
      });
    }

    return this.getProjectById(id);
  }

  async rejectProject(id: string, reason: string, userId?: string): Promise<Project> {
    const project = await this.getProjectById(id);

    if (project.status !== ProjectStatus.Pending) {
      throw new Error('Only pending projects can be rejected');
    }

    await project.update({
      status: ProjectStatus.Draft,
      // TODO: Store rejection reason if needed
    });

    // Log activity if userId is provided
    if (userId) {
      await this.activityService.logActivity({
        userId,
        action: ActivityAction.PROJECT_REJECTED,
        targetId: project.id,
        targetType: TargetType.PROJECT,
        details: JSON.stringify({
          title: project.title,
          reason,
          rejectedAt: new Date().toISOString(),
        }),
      });
    }

    return this.getProjectById(id);
  }
}
