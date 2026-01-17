import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { TransactionService } from './transaction.service';
import { Contribution } from './contribution.model';
import { Transaction } from './transaction.model';
import { CreateContributionInput } from './dto/create-contribution.input';
import { AdminCreateContributionInput } from './dto/admin-create-contribution.input';
import { ContributionFilter } from './dto/contribution-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { PaymentDetailsInput } from './dto/payment-details.input';
import { ReportFilter } from './dto/report-filter.input';
import { ReportType } from './dto/report-type.enum';
import { TransactionFilterInput } from './dto/transaction-filter.input';
import { ContributionConnection } from './types/contribution-connection.type';
import { ContributionReport } from './types/contribution-report.type';
import { TransactionConnection } from './types/transaction-connection.type';
import { BulkUpdateResult } from './types/bulk-update-result.type';
import { PaymentStatus } from './contribution.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.model';

/**
 * GraphQL Resolver for Contribution operations
 * Handles queries and mutations for contribution management
 */
@Resolver(() => Contribution)
export class ContributionResolver {
  constructor(
    private readonly contributionService: ContributionService,
    private readonly transactionService: TransactionService
  ) {}

  /**
   * Query: Get contributions with filtering and pagination
   * Admin users see all contributions, regular users see only their own
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
   */
  @Query(() => ContributionConnection)
  @UseGuards(GqlAuthGuard, RolesGuard)
  async getContributions(
    @CurrentUser() user: User,
    @Args('filter', { nullable: true }) filter?: ContributionFilter,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput
  ): Promise<ContributionConnection> {
    // Check if user is admin
    const isAdmin = user.roles?.some((role) => role.name === 'admin');

    if (isAdmin) {
      // Admin can see all contributions
      return this.contributionService.getContributions(filter, pagination);
    } else {
      // Regular users can only see their own contributions
      return this.contributionService.getUserContributions(user.id, filter, pagination);
    }
  }

  /**
   * Query: Get a single contribution by ID
   * Requirements: 3.2, 4.2
   */
  @Query(() => Contribution)
  @UseGuards(GqlAuthGuard)
  async getContribution(
    @Args('id') id: string,
    @CurrentUser() user: User
  ): Promise<Contribution> {
    const contribution = await this.contributionService.getContributionById(id);

    // Check if user is admin or owns the contribution
    const isAdmin = user.roles?.some((role) => role.name === 'admin');
    if (!isAdmin && contribution.userId !== user.id) {
      throw new Error('Unauthorized: You can only view your own contributions');
    }

    return contribution;
  }

  /**
   * Query: Get contributions for the authenticated user
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   */
  @Query(() => ContributionConnection)
  @UseGuards(GqlAuthGuard)
  async getMyContributions(
    @CurrentUser() user: User,
    @Args('filter', { nullable: true }) filter?: ContributionFilter,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput
  ): Promise<ContributionConnection> {
    return this.contributionService.getUserContributions(user.id, filter, pagination);
  }

  /**
   * Query: Get contributions for a specific project
   * Requirements: 3.4, 4.5
   */
  @Query(() => ContributionConnection)
  @UseGuards(GqlAuthGuard)
  async getProjectContributions(
    @Args('projectId') projectId: string,
    @Args('filter', { nullable: true }) filter?: ContributionFilter,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput
  ): Promise<ContributionConnection> {
    return this.contributionService.getProjectContributions(projectId, filter, pagination);
  }

  /**
   * Query: Get contribution report (admin only)
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
   */
  @Query(() => ContributionReport)
  @Roles('admin')
  @UseGuards(GqlAuthGuard, RolesGuard)
  async getContributionReport(
    @Args('reportType', { type: () => ReportType }) reportType: ReportType,
    @Args('filter', { nullable: true }) filter?: ReportFilter
  ): Promise<ContributionReport> {
    return this.contributionService.generateReport(reportType, filter);
  }

  /**
   * Query: Get transactions for a specific contribution
   * Requirements: 9.6
   */
  @Query(() => [Transaction])
  @UseGuards(GqlAuthGuard)
  async getContributionTransactions(
    @Args('contributionId') contributionId: string,
    @CurrentUser() user: User
  ): Promise<Transaction[]> {
    // Verify user has access to this contribution
    const contribution = await this.contributionService.getContributionById(contributionId);
    const isAdmin = user.roles?.some((role) => role.name === 'admin');

    if (!isAdmin && contribution.userId !== user.id) {
      throw new Error('Unauthorized: You can only view transactions for your own contributions');
    }

    return this.transactionService.getContributionTransactions(contributionId);
  }

  /**
   * Query: Get all transactions with filtering (admin only)
   * Requirements: 9.1, 9.2, 9.3, 9.4, 9.6
   */
  @Query(() => TransactionConnection)
  @Roles('admin')
  @UseGuards(GqlAuthGuard, RolesGuard)
  async getTransactions(
    @Args('filter', { nullable: true }) filter?: TransactionFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput
  ): Promise<TransactionConnection> {
    return this.transactionService.getTransactions(
      filter || {},
      pagination || { first: 20 }
    );
  }

  /**
   * Mutation: Create a new contribution (user creates for themselves)
   * Requirements: 1.1
   */
  @Mutation(() => Contribution)
  @UseGuards(GqlAuthGuard)
  async createContribution(
    @Args('input') input: CreateContributionInput,
    @CurrentUser() user: User
  ): Promise<Contribution> {
    return this.contributionService.createContribution(input, user.id);
  }

  /**
   * Mutation: Admin creates a contribution for any user
   * Requirements: 5.1, 5.2
   */
  @Mutation(() => Contribution)
  @Roles('admin')
  @UseGuards(GqlAuthGuard, RolesGuard)
  async adminCreateContribution(
    @Args('input') input: AdminCreateContributionInput,
    @CurrentUser() user: User
  ): Promise<Contribution> {
    return this.contributionService.adminCreateContribution(input, user.id);
  }

  /**
   * Mutation: Process payment for a pending contribution
   * Requirements: 2.1
   */
  @Mutation(() => Contribution)
  @UseGuards(GqlAuthGuard)
  async processContributionPayment(
    @Args('contributionId') contributionId: string,
    @Args('paymentDetails') paymentDetailsInput: PaymentDetailsInput,
    @CurrentUser() user: User
  ): Promise<Contribution> {
    // Verify user owns this contribution
    const contribution = await this.contributionService.getContributionById(contributionId);

    if (contribution.userId !== user.id) {
      throw new Error('Unauthorized: You can only process payment for your own contributions');
    }

    // Construct payment details with amount from contribution
    const paymentDetails = {
      amount: contribution.amount,
      phoneNumber: paymentDetailsInput.phoneNumber,
      accountReference: paymentDetailsInput.accountReference,
      transactionDesc: paymentDetailsInput.transactionDesc,
    };

    return this.contributionService.processPayment(contributionId, paymentDetails);
  }

  /**
   * Mutation: Update contribution status (admin only)
   * Requirements: 6.1, 6.2, 6.3
   */
  @Mutation(() => Contribution)
  @Roles('admin')
  @UseGuards(GqlAuthGuard, RolesGuard)
  async updateContributionStatus(
    @Args('contributionId') contributionId: string,
    @Args('status', { type: () => PaymentStatus }) status: PaymentStatus,
    @Args('reason', { nullable: true }) reason?: string
  ): Promise<Contribution> {
    return this.contributionService.updateContributionStatus(contributionId, status, reason);
  }

  /**
   * Mutation: Process refund for a paid contribution (admin only)
   * Requirements: 8.1
   */
  @Mutation(() => Contribution)
  @Roles('admin')
  @UseGuards(GqlAuthGuard, RolesGuard)
  async processContributionRefund(
    @Args('contributionId') contributionId: string,
    @Args('reason') reason: string
  ): Promise<Contribution> {
    return this.contributionService.processRefund(contributionId, reason);
  }

  /**
   * Mutation: Bulk update contribution statuses (admin only)
   * Requirements: 12.6
   */
  @Mutation(() => BulkUpdateResult)
  @Roles('admin')
  @UseGuards(GqlAuthGuard, RolesGuard)
  async bulkUpdateContributionStatus(
    @Args('contributionIds', { type: () => [String] }) contributionIds: string[],
    @Args('status', { type: () => PaymentStatus }) status: PaymentStatus,
    @Args('reason', { nullable: true }) reason?: string
  ): Promise<BulkUpdateResult> {
    return this.contributionService.bulkUpdateContributionStatus(
      contributionIds,
      status,
      reason
    );
  }
}
