import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IGetContributionsGQL,
  IGetContributionGQL,
  IGetMyContributionsGQL,
  IGetProjectContributionsGQL,
  IGetContributionReportGQL,
  IGetContributionTransactionsGQL,
  IGetTransactionsGQL,
} from './graphql/queries.generated';
import {
  ICreateContributionGQL,
  IAdminCreateContributionGQL,
  IProcessContributionPaymentGQL,
  IUpdateContributionStatusGQL,
  IProcessContributionRefundGQL,
  IBulkUpdateContributionStatusGQL,
} from './graphql/mutations.generated';
import {
  ICreateContributionInput,
  IAdminCreateContributionInput,
  IContributionFilter,
  IContributionPaginationInput,
  IPaymentDetailsInput,
  IPaymentStatus,
  IReportType,
  IReportFilter,
  ITransactionFilterInput,
} from '@nyots/data-source';

/**
 * Service for managing contribution-related GraphQL operations.
 * Provides methods for creating, querying, and managing contributions,
 * as well as processing payments and refunds.
 */
@Injectable({
  providedIn: 'root',
})
export class ContributionService {
  // Query operations
  private getContributionsGQL = inject(IGetContributionsGQL);
  private getContributionGQL = inject(IGetContributionGQL);
  private getMyContributionsGQL = inject(IGetMyContributionsGQL);
  private getProjectContributionsGQL = inject(IGetProjectContributionsGQL);
  private getContributionReportGQL = inject(IGetContributionReportGQL);
  private getContributionTransactionsGQL = inject(IGetContributionTransactionsGQL);
  private getTransactionsGQL = inject(IGetTransactionsGQL);

  // Mutation operations
  private createContributionGQL = inject(ICreateContributionGQL);
  private adminCreateContributionGQL = inject(IAdminCreateContributionGQL);
  private processContributionPaymentGQL = inject(IProcessContributionPaymentGQL);
  private updateContributionStatusGQL = inject(IUpdateContributionStatusGQL);
  private processContributionRefundGQL = inject(IProcessContributionRefundGQL);
  private bulkUpdateContributionStatusGQL = inject(IBulkUpdateContributionStatusGQL);

  /**
   * Retrieves all contributions with optional filters and pagination.
   * Admin users see all contributions, regular users see only their own.
   * @param params - Query parameters including filters and pagination
   * @returns Contribution connection with contributions array and page info
   */
  async getContributions(params?: {
    filter?: IContributionFilter;
    pagination?: IContributionPaginationInput;
  }) {
    const response = await firstValueFrom(
      this.getContributionsGQL.fetch({
        variables: {
          filter: params?.filter,
          pagination: params?.pagination,
        },
      })
    );
    return response.data?.getContributions;
  }

  /**
   * Retrieves a single contribution by ID.
   * @param id - Contribution ID
   * @returns Contribution details including transactions
   */
  async getContribution(id: string) {
    const response = await firstValueFrom(
      this.getContributionGQL.fetch({ variables: { id } })
    );
    return response.data?.getContribution;
  }

  /**
   * Retrieves contributions for the authenticated user.
   * @param params - Query parameters including filters and pagination
   * @returns Contribution connection with user's contributions
   */
  async getMyContributions(params?: {
    filter?: IContributionFilter;
    pagination?: IContributionPaginationInput;
  }) {
    const response = await firstValueFrom(
      this.getMyContributionsGQL.fetch({
        variables: {
          filter: params?.filter,
          pagination: params?.pagination,
        },
      })
    );
    return response.data?.getMyContributions;
  }

  /**
   * Retrieves contributions for a specific project.
   * @param projectId - Project ID
   * @param params - Query parameters including filters and pagination
   * @returns Contribution connection with project contributions
   */
  async getProjectContributions(
    projectId: string,
    params?: {
      filter?: IContributionFilter;
      pagination?: IContributionPaginationInput;
    }
  ) {
    const response = await firstValueFrom(
      this.getProjectContributionsGQL.fetch({
        variables: {
          projectId,
          filter: params?.filter,
          pagination: params?.pagination,
        },
      })
    );
    return response.data?.getProjectContributions;
  }

  /**
   * Creates a new contribution for the authenticated user.
   * @param input - Contribution creation input
   * @returns Created contribution
   */
  async createContribution(input: ICreateContributionInput) {
    const response = await firstValueFrom(
      this.createContributionGQL.mutate({
        variables: { input },
      })
    );
    return response.data?.createContribution;
  }

  /**
   * Creates a new contribution as an admin (can specify any user).
   * @param input - Admin contribution creation input
   * @returns Created contribution
   */
  async adminCreateContribution(input: IAdminCreateContributionInput) {
    const response = await firstValueFrom(
      this.adminCreateContributionGQL.mutate({
        variables: { input },
      })
    );
    return response.data?.adminCreateContribution;
  }

  /**
   * Processes payment for a pending contribution.
   * @param contributionId - Contribution ID
   * @param paymentDetails - Payment details including method and token
   * @returns Updated contribution with transaction details
   */
  async processPayment(
    contributionId: string,
    paymentDetails: IPaymentDetailsInput
  ) {
    const response = await firstValueFrom(
      this.processContributionPaymentGQL.mutate({
        variables: { contributionId, paymentDetails },
      })
    );
    return response.data?.processContributionPayment;
  }

  /**
   * Updates the status of a contribution (admin only).
   * @param contributionId - Contribution ID
   * @param status - New payment status
   * @param reason - Optional reason for status change
   * @returns Updated contribution
   */
  async updateStatus(
    contributionId: string,
    status: IPaymentStatus,
    reason?: string
  ) {
    const response = await firstValueFrom(
      this.updateContributionStatusGQL.mutate({
        variables: { contributionId, status, reason },
      })
    );
    return response.data?.updateContributionStatus;
  }

  /**
   * Processes a refund for a paid contribution (admin only).
   * @param contributionId - Contribution ID
   * @param reason - Required reason for refund
   * @returns Updated contribution with refund transaction
   */
  async processRefund(contributionId: string, reason: string) {
    const response = await firstValueFrom(
      this.processContributionRefundGQL.mutate({
        variables: { contributionId, reason },
      })
    );
    return response.data?.processContributionRefund;
  }

  /**
   * Updates the status of multiple contributions in bulk (admin only).
   * @param contributionIds - Array of contribution IDs
   * @param status - New payment status
   * @param reason - Optional reason for status change
   * @returns Bulk update result with success/failure counts
   */
  async bulkUpdateStatus(
    contributionIds: string[],
    status: IPaymentStatus,
    reason?: string
  ) {
    const response = await firstValueFrom(
      this.bulkUpdateContributionStatusGQL.mutate({
        variables: { contributionIds, status, reason },
      })
    );
    return response.data?.bulkUpdateContributionStatus;
  }

  /**
   * Generates a contribution report with various aggregations.
   * @param reportType - Type of report (summary, by project, by user, time series)
   * @param filter - Optional filters for the report
   * @returns Contribution report with aggregated data
   */
  async getReport(reportType: IReportType, filter?: IReportFilter) {
    const response = await firstValueFrom(
      this.getContributionReportGQL.fetch({
        variables: { reportType, filter },
      })
    );
    return response.data?.getContributionReport;
  }

  /**
   * Retrieves all transactions for a specific contribution.
   * @param contributionId - Contribution ID
   * @returns Array of transactions
   */
  async getContributionTransactions(contributionId: string) {
    const response = await firstValueFrom(
      this.getContributionTransactionsGQL.fetch({
        variables: { contributionId },
      })
    );
    return response.data?.getContributionTransactions;
  }

  /**
   * Retrieves all transactions with optional filters and pagination (admin only).
   * @param params - Query parameters including filters and pagination
   * @returns Transaction connection with transactions array and page info
   */
  async getTransactions(params?: {
    filter?: ITransactionFilterInput;
    pagination?: IContributionPaginationInput;
  }) {
    const response = await firstValueFrom(
      this.getTransactionsGQL.fetch({
        variables: {
          filter: params?.filter,
          pagination: params?.pagination,
        },
      })
    );
    return response.data?.getTransactions;
  }
}
