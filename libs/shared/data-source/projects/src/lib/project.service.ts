import { Injectable } from '@angular/core';
// import { inject } from '@angular/core';
// import { firstValueFrom } from 'rxjs';
// import {
//   IGetAllProjectsGQL,
//   IGetProjectByIdGQL,
//   IGetActiveProjectsGQL,
//   IGetPendingProjectsGQL,
//   IGetArchivedProjectsGQL,
//   ICreateProjectGQL,
//   IUpdateProjectGQL,
//   IDeleteProjectGQL,
//   IBulkUpdateProjectsGQL,
//   IApproveProjectGQL,
//   IRejectProjectGQL,
// } from './graphql/projects.generated';
import {
  ICreateProjectInput,
  IUpdateProjectInput,
  IProjectFilter,
  IArchivedProjectFilter,
  IPaginationInput,
  IBulkUpdateInput,
} from './types';

/**
 * Service for managing project-related GraphQL operations.
 * 
 * Note: This service requires the GraphQL schema to be defined in the backend
 * and codegen to be run to generate the GQL service classes.
 * 
 * Run: npm run graphql-codegen:dataSource
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  // Uncomment these once codegen has been run
  // private getAllProjectsGQL = inject(IGetAllProjectsGQL);
  // private getProjectByIdGQL = inject(IGetProjectByIdGQL);
  // private getActiveProjectsGQL = inject(IGetActiveProjectsGQL);
  // private getPendingProjectsGQL = inject(IGetPendingProjectsGQL);
  // private getArchivedProjectsGQL = inject(IGetArchivedProjectsGQL);
  // private createProjectGQL = inject(ICreateProjectGQL);
  // private updateProjectGQL = inject(IUpdateProjectGQL);
  // private deleteProjectGQL = inject(IDeleteProjectGQL);
  // private bulkUpdateProjectsGQL = inject(IBulkUpdateProjectsGQL);
  // private approveProjectGQL = inject(IApproveProjectGQL);
  // private rejectProjectGQL = inject(IRejectProjectGQL);

  async getAllProjects(params: {
    search?: string;
    filters?: IProjectFilter;
    pagination?: IPaginationInput;
  }) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async getProjectById(id: string) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async getActiveProjects(pagination?: IPaginationInput) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async getPendingProjects(pagination?: IPaginationInput) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async getArchivedProjects(params: {
    filter?: IArchivedProjectFilter;
    pagination?: IPaginationInput;
  }) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async createProject(input: ICreateProjectInput) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async updateProject(id: string, input: IUpdateProjectInput) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async deleteProject(id: string) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async bulkUpdateProjects(ids: string[], input: IBulkUpdateInput) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async approveProject(id: string, notes?: string) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }

  async rejectProject(id: string, reason: string) {
    // Implementation will be added in task 2
    throw new Error('Not implemented - requires backend GraphQL schema and codegen');
  }
}
