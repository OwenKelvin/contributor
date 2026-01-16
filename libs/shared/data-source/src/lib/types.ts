export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type IArchivedProjectFilter = {
  archivedAfter?: InputMaybe<Scalars['DateTime']['input']>;
  archivedBefore?: InputMaybe<Scalars['DateTime']['input']>;
};

export type IAuthResponse = {
  accessToken: Scalars['String']['output'];
  user: IUser;
};

export type IBulkUpdateInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<IProjectStatus>;
};

export type IBulkUpdateResult = {
  errors?: Maybe<Array<Scalars['String']['output']>>;
  failureCount: Scalars['Int']['output'];
  successCount: Scalars['Int']['output'];
};

export type ICategory = {
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  projectCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ICreateCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type ICreateProjectInput = {
  categoryId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  detailedDescription: Scalars['String']['input'];
  endDate: Scalars['DateTime']['input'];
  featuredImage?: InputMaybe<Scalars['String']['input']>;
  goalAmount: Scalars['Float']['input'];
  startDate: Scalars['DateTime']['input'];
  status: IProjectStatus;
  title: Scalars['String']['input'];
};

export type IDateRangeInput = {
  end: Scalars['DateTime']['input'];
  start: Scalars['DateTime']['input'];
};

export type ILoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type IMutation = {
  approveProject: IProject;
  bulkUpdateProjects: IBulkUpdateResult;
  createCategory: ICategory;
  createProject: IProject;
  deleteCategory: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  login: IAuthResponse;
  register: IAuthResponse;
  rejectProject: IProject;
  updateCategory: ICategory;
  updateProject: IProject;
};


export type IMutationApproveProjectArgs = {
  id: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
};


export type IMutationBulkUpdateProjectsArgs = {
  ids: Array<Scalars['ID']['input']>;
  input: IBulkUpdateInput;
};


export type IMutationCreateCategoryArgs = {
  input: ICreateCategoryInput;
};


export type IMutationCreateProjectArgs = {
  input: ICreateProjectInput;
};


export type IMutationDeleteCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type IMutationDeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type IMutationLoginArgs = {
  loginInput: ILoginInput;
};


export type IMutationRegisterArgs = {
  registerInput: IRegisterInput;
};


export type IMutationRejectProjectArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type IMutationUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  input: IUpdateCategoryInput;
};


export type IMutationUpdateProjectArgs = {
  id: Scalars['ID']['input'];
  input: IUpdateProjectInput;
};

export type IPageInfo = {
  cursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
};

export type IPaginationInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
};

export type IProject = {
  category: ICategory;
  createdAt: Scalars['DateTime']['output'];
  currentAmount: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  detailedDescription: Scalars['String']['output'];
  endDate: Scalars['DateTime']['output'];
  featuredImage?: Maybe<Scalars['String']['output']>;
  goalAmount: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  startDate: Scalars['DateTime']['output'];
  status: IProjectStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type IProjectConnection = {
  pageInfo: IPageInfo;
  projects: Array<IProject>;
};

export type IProjectFilter = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  dateRange?: InputMaybe<IDateRangeInput>;
  status?: InputMaybe<IProjectStatus>;
};

export enum IProjectStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Completed = 'COMPLETED',
  Draft = 'DRAFT',
  Pending = 'PENDING'
}

export type IQuery = {
  getActiveProjects: IProjectConnection;
  getAllCategories: Array<ICategory>;
  getAllProjects: IProjectConnection;
  getArchivedProjects: IProjectConnection;
  getPendingProjects: IProjectConnection;
  getProjectById: IProject;
  test?: Maybe<Scalars['String']['output']>;
};


export type IQueryGetActiveProjectsArgs = {
  pagination?: InputMaybe<IPaginationInput>;
};


export type IQueryGetAllProjectsArgs = {
  filter?: InputMaybe<IProjectFilter>;
  pagination?: InputMaybe<IPaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type IQueryGetArchivedProjectsArgs = {
  filter?: InputMaybe<IArchivedProjectFilter>;
  pagination?: InputMaybe<IPaginationInput>;
};


export type IQueryGetPendingProjectsArgs = {
  pagination?: InputMaybe<IPaginationInput>;
};


export type IQueryGetProjectByIdArgs = {
  id: Scalars['ID']['input'];
};

export type IRegisterInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type IRole = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type IUpdateCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type IUpdateProjectInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  detailedDescription?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  featuredImage?: InputMaybe<Scalars['String']['input']>;
  goalAmount?: InputMaybe<Scalars['Float']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<IProjectStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type IUser = {
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Array<IRole>>;
};

export type IAdminCreateContributionInput = {
  amount: Scalars['Float']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentReference?: InputMaybe<Scalars['String']['input']>;
  paymentStatus: IPaymentStatus;
  projectId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type IBulkUpdateError = {
  contributionId: Scalars['String']['output'];
  error: Scalars['String']['output'];
};

export type IContribution = {
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  failureReason?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentReference?: Maybe<Scalars['String']['output']>;
  paymentStatus: IPaymentStatus;
  project: IProject;
  transactions: Array<ITransaction>;
  updatedAt: Scalars['DateTime']['output'];
  user: IUser;
};

export type IContributionBulkUpdateResult = {
  errors: Array<IBulkUpdateError>;
  failureCount: Scalars['Int']['output'];
  successCount: Scalars['Int']['output'];
};

export type IContributionConnection = {
  edges: Array<IContributionEdge>;
  pageInfo: IPageInfo;
  totalAmount: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type IContributionEdge = {
  cursor: Scalars['String']['output'];
  node: IContribution;
};

export type IContributionFilter = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  maxAmount?: InputMaybe<Scalars['Float']['input']>;
  minAmount?: InputMaybe<Scalars['Float']['input']>;
  paymentStatus?: InputMaybe<IPaymentStatus>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type IContributionPaginationInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type IContributionReport = {
  failedAmount: Scalars['Float']['output'];
  failedCount: Scalars['Int']['output'];
  paidAmount: Scalars['Float']['output'];
  paidCount: Scalars['Int']['output'];
  pendingAmount: Scalars['Float']['output'];
  pendingCount: Scalars['Int']['output'];
  refundedAmount: Scalars['Float']['output'];
  refundedCount: Scalars['Int']['output'];
  successRate: Scalars['Float']['output'];
  timeSeriesData: Array<ITimeSeriesPoint>;
  topContributors: Array<IUserContributionSummary>;
  topProjects: Array<IProjectContributionSummary>;
  totalAmount: Scalars['Float']['output'];
  totalContributions: Scalars['Int']['output'];
};

export type ICreateContributionInput = {
  amount: Scalars['Float']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
};

export type IPaymentDetailsInput = {
  accountReference: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  transactionDesc?: InputMaybe<Scalars['String']['input']>;
};

export enum IPaymentStatus {
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Refunded = 'REFUNDED'
}

export type IProjectContributionSummary = {
  contributionCount: Scalars['Int']['output'];
  projectId: Scalars['ID']['output'];
  projectTitle: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type IReportFilter = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export enum IReportType {
  ByProject = 'BY_PROJECT',
  ByUser = 'BY_USER',
  Summary = 'SUMMARY',
  TimeSeries = 'TIME_SERIES'
}

export type ITimeSeriesPoint = {
  contributionCount: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type ITransaction = {
  amount: Scalars['Float']['output'];
  contribution: IContribution;
  createdAt: Scalars['DateTime']['output'];
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  gatewayResponse?: Maybe<Scalars['String']['output']>;
  gatewayTransactionId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status: ITransactionStatus;
  transactionType: ITransactionType;
};

export type ITransactionConnection = {
  edges: Array<ITransactionEdge>;
  pageInfo: IPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ITransactionEdge = {
  cursor: Scalars['String']['output'];
  node: ITransaction;
};

export type ITransactionFilterInput = {
  contributionId?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<ITransactionStatus>;
  transactionType?: InputMaybe<ITransactionType>;
};

export enum ITransactionStatus {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Success = 'SUCCESS'
}

export enum ITransactionType {
  Payment = 'PAYMENT',
  Refund = 'REFUND'
}

export type IUserContributionSummary = {
  contributionCount: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
  userEmail: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
  userName: Scalars['String']['output'];
};
