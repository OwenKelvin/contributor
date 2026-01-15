import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { Project } from './project.model';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { ProjectFilter } from './dto/project-filter.input';
import { ArchivedProjectFilter } from './dto/archived-project-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { BulkUpdateInput } from './dto/bulk-update.input';
import { ProjectConnection } from './types/project-connection.type';
import { BulkUpdateResult } from './types/bulk-update-result.type';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => ProjectConnection)
  async getAllProjects(
    @Args('search', { nullable: true }) search?: string,
    @Args('filter', { nullable: true }) filter?: ProjectFilter,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<ProjectConnection> {
    return this.projectService.getAllProjects(search, filter, pagination);
  }

  @Query(() => Project)
  async getProjectById(@Args('id') id: string): Promise<Project> {
    return this.projectService.getProjectById(id);
  }

  @Query(() => ProjectConnection)
  async getActiveProjects(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<ProjectConnection> {
    return this.projectService.getActiveProjects(pagination);
  }

  @Query(() => ProjectConnection)
  async getPendingProjects(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<ProjectConnection> {
    return this.projectService.getPendingProjects(pagination);
  }

  @Query(() => ProjectConnection)
  async getArchivedProjects(
    @Args('filter', { nullable: true }) filter?: ArchivedProjectFilter,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<ProjectConnection> {
    return this.projectService.getArchivedProjects(filter, pagination);
  }

  @Mutation(() => Project)
  async createProject(@Args('input') input: CreateProjectInput): Promise<Project> {
    return this.projectService.createProject(input);
  }

  @Mutation(() => Project)
  async updateProject(
    @Args('id') id: string,
    @Args('input') input: UpdateProjectInput,
  ): Promise<Project> {
    return this.projectService.updateProject(id, input);
  }

  @Mutation(() => Boolean)
  async deleteProject(@Args('id') id: string): Promise<boolean> {
    return this.projectService.deleteProject(id);
  }

  @Mutation(() => BulkUpdateResult)
  async bulkUpdateProjects(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('input') input: BulkUpdateInput,
  ): Promise<BulkUpdateResult> {
    return this.projectService.bulkUpdateProjects(ids, input);
  }

  @Mutation(() => Project)
  async approveProject(
    @Args('id') id: string,
    @Args('notes', { nullable: true }) notes?: string,
  ): Promise<Project> {
    return this.projectService.approveProject(id, notes);
  }

  @Mutation(() => Project)
  async rejectProject(
    @Args('id') id: string,
    @Args('reason') reason: string,
  ): Promise<Project> {
    return this.projectService.rejectProject(id, reason);
  }
}
