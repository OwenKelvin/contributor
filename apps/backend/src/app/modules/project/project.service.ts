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

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project)
    private projectModel: typeof Project,
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
    const limit = pagination?.limit || 20;
    const offset = pagination?.cursor ? parseInt(pagination.cursor, 10) : 0;

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

    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor: projects.length > 0 ? String(offset) : null,
      endCursor: hasNextPage ? String(offset + limit) : null,
    };

    return {
      projects,
      pageInfo,
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
    return this.getAllProjects(undefined, { status: ProjectStatus.ACTIVE }, pagination);
  }

  async getPendingProjects(pagination?: PaginationInput): Promise<ProjectConnection> {
    return this.getAllProjects(undefined, { status: ProjectStatus.PENDING }, pagination);
  }

  async getArchivedProjects(
    filter?: ArchivedProjectFilter,
    pagination?: PaginationInput,
  ): Promise<ProjectConnection> {
    const where: any = { status: ProjectStatus.ARCHIVED };

    if (filter?.archivedAfter) {
      where.updatedAt = { [Op.gte]: filter.archivedAfter };
    }
    if (filter?.archivedBefore) {
      where.updatedAt = {
        ...where.updatedAt,
        [Op.lte]: filter.archivedBefore,
      };
    }

    const limit = pagination?.limit || 20;
    const offset = pagination?.cursor ? parseInt(pagination.cursor, 10) : 0;

    const { rows: projects } = await this.projectModel.findAndCountAll({
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

    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor: projects.length > 0 ? String(offset) : null,
      endCursor: hasNextPage ? String(offset + limit) : null,
    };

    return {
      projects,
      pageInfo,
    };
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
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

    return this.getProjectById(project.id);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const project = await this.getProjectById(id);
    await project.update(input);
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<boolean> {
    const project = await this.getProjectById(id);
    await project.destroy();
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

  async approveProject(id: string, notes?: string): Promise<Project> {
    const project = await this.getProjectById(id);

    if (project.status !== ProjectStatus.PENDING) {
      throw new Error('Only pending projects can be approved');
    }

    await project.update({
      status: ProjectStatus.ACTIVE,
      // TODO: Store approval notes if needed
    });

    return this.getProjectById(id);
  }

  async rejectProject(id: string, reason: string): Promise<Project> {
    const project = await this.getProjectById(id);

    if (project.status !== ProjectStatus.PENDING) {
      throw new Error('Only pending projects can be rejected');
    }

    await project.update({
      status: ProjectStatus.DRAFT,
      // TODO: Store rejection reason if needed
    });

    return this.getProjectById(id);
  }
}
