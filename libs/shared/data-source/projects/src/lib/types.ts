import { Scalars } from '@nyots/data-source';

// Project interfaces
export interface IProject {
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  description: Scalars['String']['output'];
  detailedDescription: Scalars['String']['output'];
  goalAmount: Scalars['Float']['output'];
  currentAmount: Scalars['Float']['output'];
  startDate: Scalars['String']['output'];
  endDate: Scalars['String']['output'];
  status: ProjectStatus;
  category: ICategory;
  featuredImage?: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface ICreateProjectInput {
  title: Scalars['String']['input'];
  description: Scalars['String']['input'];
  detailedDescription: Scalars['String']['input'];
  goalAmount: Scalars['Float']['input'];
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  categoryId: Scalars['ID']['input'];
  featuredImage?: Scalars['String']['input'];
  status: ProjectStatus;
}

export interface IUpdateProjectInput {
  title?: Scalars['String']['input'];
  description?: Scalars['String']['input'];
  detailedDescription?: Scalars['String']['input'];
  goalAmount?: Scalars['Float']['input'];
  startDate?: Scalars['String']['input'];
  endDate?: Scalars['String']['input'];
  categoryId?: Scalars['ID']['input'];
  featuredImage?: Scalars['String']['input'];
  status?: ProjectStatus;
}

export interface IProjectFilter {
  status?: ProjectStatus;
  categoryId?: Scalars['ID']['input'];
  dateRange?: IDateRangeInput;
}

export interface IArchivedProjectFilter {
  archivedAfter?: Scalars['String']['input'];
  archivedBefore?: Scalars['String']['input'];
}

export interface IDateRangeInput {
  start: Scalars['String']['input'];
  end: Scalars['String']['input'];
}

export interface IPaginationInput {
  cursor?: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
}

export interface IPageInfo {
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  cursor?: Scalars['String']['output'];
}

export interface IProjectConnection {
  projects: IProject[];
  pageInfo: IPageInfo;
}

// Category interfaces
export interface ICategory {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  description?: Scalars['String']['output'];
  projectCount: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
}

export interface ICreateCategoryInput {
  name: Scalars['String']['input'];
  description?: Scalars['String']['input'];
}

export interface IUpdateCategoryInput {
  name?: Scalars['String']['input'];
  description?: Scalars['String']['input'];
}

// Bulk operation interfaces
export interface IBulkUpdateInput {
  status?: ProjectStatus;
  categoryId?: Scalars['ID']['input'];
}

export interface IBulkUpdateResult {
  successCount: Scalars['Int']['output'];
  failureCount: Scalars['Int']['output'];
  errors: Scalars['String']['output'][];
}
