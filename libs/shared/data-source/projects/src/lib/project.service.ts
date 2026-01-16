import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IGetAllProjectsGQL,
  IGetProjectByIdGQL,
  IGetActiveProjectsGQL,
  IGetPendingProjectsGQL,
  IGetArchivedProjectsGQL,
  ICreateProjectGQL,
  IUpdateProjectGQL,
  IDeleteProjectGQL,
  IBulkUpdateProjectsGQL,
  IApproveProjectGQL,
  IRejectProjectGQL,
} from './graphql/projects.generated';
import {
  ICreateProjectInput,
  IUpdateProjectInput,
  IProjectFilter,
  IArchivedProjectFilter,
  IProjectPaginationInput,
  IBulkUpdateInput,
} from '@nyots/data-source';

/**
 * Service for managing project-related GraphQL operations.
 * Follows the error handling pattern from AuthService.
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private getAllProjectsGQL = inject(IGetAllProjectsGQL);
  private getProjectByIdGQL = inject(IGetProjectByIdGQL);
  private getActiveProjectsGQL = inject(IGetActiveProjectsGQL);
  private getPendingProjectsGQL = inject(IGetPendingProjectsGQL);
  private getArchivedProjectsGQL = inject(IGetArchivedProjectsGQL);
  private createProjectGQL = inject(ICreateProjectGQL);
  private updateProjectGQL = inject(IUpdateProjectGQL);
  private deleteProjectGQL = inject(IDeleteProjectGQL);
  private bulkUpdateProjectsGQL = inject(IBulkUpdateProjectsGQL);
  private approveProjectGQL = inject(IApproveProjectGQL);
  private rejectProjectGQL = inject(IRejectProjectGQL);

  /**
   * Retrieves all projects with optional search, filters, and pagination.
   * @param params - Query parameters including search term, filters, and pagination
   * @returns Project connection with projects array and page info
   */
  async getAllProjects(params: {
    search?: string;
    filters?: IProjectFilter;
    pagination?: IProjectPaginationInput;
  }) {
    const response = await firstValueFrom(
      this.getAllProjectsGQL.fetch({
        variables: {
          search: params.search,
          filter: params.filters,
          pagination: params.pagination,
        },
      })
    );
    return response.data?.getAllProjects;
  }

  /**
   * Retrieves a single project by ID.
   * @param id - Project ID
   * @returns Project details
   */
  async getProjectById(id: string) {
    const response = await firstValueFrom(
      this.getProjectByIdGQL.fetch({ variables: { id } })
    );
    return response.data?.getProjectById;
  }

  /**
   * Retrieves all active projects with optional pagination.
   * @param pagination - Pagination parameters
   * @returns Project connection with active projects
   */
  async getActiveProjects(pagination?: IProjectPaginationInput) {
    const response = await firstValueFrom(
      this.getActiveProjectsGQL.fetch({ variables: { pagination } })
    );
    return response.data?.getActiveProjects;
  }

  /**
   * Retrieves all pending projects with optional pagination.
   * @param pagination - Pagination parameters
   * @returns Project connection with pending projects
   */
  async getPendingProjects(pagination?: IProjectPaginationInput) {
    const response = await firstValueFrom(
      this.getPendingProjectsGQL.fetch({ variables: { pagination } })
    );
    return response.data?.getPendingProjects;
  }

  /**
   * Retrieves archived projects with optional filters and pagination.
   * @param params - Query parameters including archive date filters and pagination
   * @returns Project connection with archived projects
   */
  async getArchivedProjects(params: {
    filter?: IArchivedProjectFilter;
    pagination?: IProjectPaginationInput;
  }) {
    const response = await firstValueFrom(
      this.getArchivedProjectsGQL.fetch({
        variables: {
          filter: params.filter,
          pagination: params.pagination,
        },
      })
    );
    return response.data?.getArchivedProjects;
  }

  /**
   * Creates a new project.
   * @param input - Project creation input
   * @returns Created project
   */
  async createProject(input: ICreateProjectInput) {
    const response = await firstValueFrom(
      this.createProjectGQL.mutate({
        variables: { input },
      })
    );
    return response.data?.createProject;
  }

  /**
   * Updates an existing project.
   * @param id - Project ID
   * @param input - Project update input
   * @returns Updated project
   */
  async updateProject(id: string, input: IUpdateProjectInput) {
    const response = await firstValueFrom(
      this.updateProjectGQL.mutate({
        variables: { id, input },
      })
    );
    return response.data?.updateProject;
  }

  /**
   * Deletes a project.
   * @param id - Project ID
   * @returns Boolean indicating success
   */
  async deleteProject(id: string) {
    const response = await firstValueFrom(
      this.deleteProjectGQL.mutate({
        variables: { id },
      })
    );
    return response.data?.deleteProject;
  }

  /**
   * Performs bulk update on multiple projects.
   * @param ids - Array of project IDs
   * @param input - Bulk update input
   * @returns Bulk update result with success/failure counts
   */
  async bulkUpdateProjects(ids: string[], input: IBulkUpdateInput) {
    const response = await firstValueFrom(
      this.bulkUpdateProjectsGQL.mutate({
        variables: { ids, input },
      })
    );
    return response.data?.bulkUpdateProjects;
  }

  /**
   * Approves a pending project.
   * @param id - Project ID
   * @param notes - Optional approval notes
   * @returns Approved project
   */
  async approveProject(id: string, notes?: string) {
    const response = await firstValueFrom(
      this.approveProjectGQL.mutate({
        variables: { id, notes },
      })
    );
    return response.data?.approveProject;
  }

  /**
   * Rejects a pending project.
   * @param id - Project ID
   * @param reason - Required rejection reason
   * @returns Rejected project
   */
  async rejectProject(id: string, reason: string) {
    const response = await firstValueFrom(
      this.rejectProjectGQL.mutate({
        variables: { id, reason },
      })
    );
    return response.data?.rejectProject;
  }
}
