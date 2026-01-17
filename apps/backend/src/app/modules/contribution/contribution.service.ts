import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op, WhereOptions } from 'sequelize';
import { Contribution, PaymentStatus } from './contribution.model';
import { Project, ProjectStatus } from '../project/project.model';
import { User } from '../user/user.model';
import { TransactionService } from './transaction.service';
import { EmailService } from '../email/email.service';
import { CreateContributionInput } from './dto/create-contribution.input';
import { AdminCreateContributionInput } from './dto/admin-create-contribution.input';
import { ContributionFilter } from './dto/contribution-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { ContributionConnection } from './types/contribution-connection.type';
import { ContributionEdge } from './types/contribution-edge.type';
import { PageInfo } from '../../common/types/page-info.type';
import { PaymentDetails } from '../payment';
import { ContributionAuditLog } from './audit-log.model';
import { ReportFilter } from './dto/report-filter.input';
import { ReportType } from './dto/report-type.enum';
import { ContributionReport } from './types/contribution-report.type';
import { ProjectContributionSummary } from './types/project-contribution-summary.type';
import { UserContributionSummary } from './types/user-contribution-summary.type';
import { TimeSeriesPoint } from './types/time-series-point.type';
import { BulkUpdateResult, BulkUpdateError } from './types/bulk-update-result.type';

/**
 * Contribution Service
 * Handles core contribution operations including creation, validation, and retrieval
 */
@Injectable()
export class ContributionService {
  private readonly logger = new Logger(ContributionService.name);

  constructor(
    @InjectModel(Contribution)
    private readonly contributionModel: typeof Contribution,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(ContributionAuditLog)
    private readonly auditLogModel: typeof ContributionAuditLog,
    private readonly transactionService: TransactionService,
    private readonly emailService: EmailService,
    private readonly sequelize: Sequelize
  ) {}

  /**
   * Create a new contribution for the authenticated user
   * @param input - Contribution creation data
   * @param userId - Authenticated user ID
   * @returns Created contribution
   */
  async createContribution(
    input: CreateContributionInput,
    userId: string
  ): Promise<Contribution> {
    this.logger.log(`Creating contribution for user ${userId}, project ${input.projectId}`);

    // Validate user exists
    await this.validateUser(userId);

    // Validate project exists and is active
    await this.validateProject(input.projectId);

    // Validate amount
    this.validateAmount(input.amount);

    try {
      const contribution = await this.contributionModel.create({
        userId,
        projectId: input.projectId,
        amount: input.amount,
        paymentStatus: PaymentStatus.PENDING,
        notes: input.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.logger.log(`Contribution ${contribution.id} created successfully`);

      // Load relationships for return
      return await this.getContributionById(contribution.id);
    } catch (error) {
      this.logger.error(`Failed to create contribution: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a contribution by ID with all relationships loaded
   * @param id - Contribution ID
   * @returns Contribution with user, project, and transactions
   * @throws NotFoundException if contribution not found
   */
  async getContributionById(id: string): Promise<Contribution> {
    this.logger.log(`Fetching contribution ${id}`);

    const contribution = await this.contributionModel.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: Project, as: 'project' },
        { association: 'transactions' },
      ],
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution with ID ${id} not found`);
    }

    return contribution;
  }

  /**
   * Validate that a project exists and is active
   * @param projectId - Project ID to validate
   * @throws NotFoundException if project not found
   * @throws UnprocessableEntityException if project is not active
   */
  private async validateProject(projectId: string): Promise<void> {
    const project = await this.projectModel.findByPk(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status !== ProjectStatus.ACTIVE) {
      throw new UnprocessableEntityException(
        `Project ${projectId} is not active. Current status: ${project.status}`
      );
    }
  }

  /**
   * Validate that a user exists
   * @param userId - User ID to validate
   * @throws NotFoundException if user not found
   */
  private async validateUser(userId: string): Promise<void> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  /**
   * Validate contribution amount
   * @param amount - Amount to validate
   * @throws BadRequestException if amount is invalid
   */
  private validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Contribution amount must be greater than zero');
    }

    // Check for more than 2 decimal places
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new BadRequestException(
        'Contribution amount cannot have more than 2 decimal places'
      );
    }
  }

  /**
   * Process payment for a pending contribution
   * @param contributionId - Contribution ID
   * @param paymentDetails - Payment details (phone number, etc.)
   * @returns Updated contribution with paid status
   * @throws NotFoundException if contribution not found
   * @throws UnprocessableEntityException if contribution is not pending
   */
  async processPayment(
    contributionId: string,
    paymentDetails: PaymentDetails
  ): Promise<Contribution> {
    this.logger.log(`Processing payment for contribution ${contributionId}`);

    // Get contribution with relationships
    const contribution = await this.getContributionById(contributionId);

    // Validate contribution is in pending status
    if (contribution.paymentStatus !== PaymentStatus.PENDING) {
      throw new UnprocessableEntityException(
        `Cannot process payment for contribution with status ${contribution.paymentStatus}. Only pending contributions can be paid.`
      );
    }

    // Start database transaction for atomicity
    const transaction = await this.sequelize.transaction();

    try {
      // Process payment through transaction service
      const transactionResult = await this.transactionService.processPayment(
        contributionId,
        contribution.amount,
        paymentDetails
      );

      if (transactionResult.success) {
        // Update contribution status to paid
        await contribution.update(
          {
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
            failureReason: undefined,
          },
          { transaction }
        );

        // Update project amount
        await this.updateProjectAmount(
          contribution.projectId,
          contribution.amount,
          'add',
          transaction
        );

        // Commit transaction
        await transaction.commit();

        this.logger.log(`Payment processed successfully for contribution ${contributionId}`);

        // Send success email (async, don't wait)
        this.emailService
          .sendPaymentSuccessEmail(contribution)
          .catch((error) => {
            this.logger.error(
              `Failed to send payment success email for contribution ${contributionId}: ${error.message}`,
              error.stack
            );
          });

        // Reload contribution with updated relationships
        return await this.getContributionById(contributionId);
      } else {
        // Payment failed - update contribution status
        await contribution.update(
          {
            paymentStatus: PaymentStatus.FAILED,
            failureReason: transactionResult.errorMessage || 'Payment processing failed',
          },
          { transaction }
        );

        // Commit transaction (no project amount update on failure)
        await transaction.commit();

        this.logger.warn(
          `Payment failed for contribution ${contributionId}: ${transactionResult.errorMessage}`
        );

        // Send failure email (async, don't wait)
        this.emailService
          .sendPaymentFailureEmail(contribution, transactionResult.errorMessage)
          .catch((error) => {
            this.logger.error(
              `Failed to send payment failure email for contribution ${contributionId}: ${error.message}`,
              error.stack
            );
          });

        // Reload contribution with updated status
        return await this.getContributionById(contributionId);
      }
    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();

      this.logger.error(
        `Error processing payment for contribution ${contributionId}: ${error.message}`,
        error.stack
      );

      throw error;
    }
  }

  /**
   * Update project amount (add or subtract)
   * @param projectId - Project ID
   * @param amount - Amount to add or subtract
   * @param operation - 'add' or 'subtract'
   * @param transaction - Database transaction
   * @throws NotFoundException if project not found
   * @throws UnprocessableEntityException if operation would make amount negative
   */
  private async updateProjectAmount(
    projectId: string,
    amount: number,
    operation: 'add' | 'subtract',
    transaction?: import('sequelize').Transaction
  ): Promise<void> {
    this.logger.log(`Updating project ${projectId} amount: ${operation} ${amount}`);

    const project = await this.projectModel.findByPk(projectId, { transaction });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const currentAmount = Number(project.currentAmount);
    let newAmount: number;

    if (operation === 'add') {
      newAmount = currentAmount + amount;
    } else {
      newAmount = currentAmount - amount;
    }

    // Validate that amount won't go negative
    if (newAmount < 0) {
      throw new UnprocessableEntityException(
        `Cannot ${operation} ${amount} from project ${projectId}. Current amount is ${currentAmount} and operation would result in negative amount (${newAmount}).`
      );
    }

    // Update project amount
    await project.update({ currentAmount: newAmount }, { transaction });

    this.logger.log(
      `Project ${projectId} amount updated: ${currentAmount} -> ${newAmount}`
    );
  }

  /**
   * Get contributions with filtering, pagination, and search
   * @param filter - Filter criteria
   * @param pagination - Pagination parameters
   * @returns Paginated contributions with metadata
   */
  async getContributions(
    filter: ContributionFilter = {},
    pagination: PaginationInput = {}
  ): Promise<ContributionConnection> {
    this.logger.log('Fetching contributions with filters and pagination');

    // Build where clause from filters
    const where = this.buildWhereClause(filter);

    // Set default pagination values
    const limit = pagination.first || 20;
    const offset = this.calculateOffset(pagination);

    try {
      // Execute query with count
      const { rows: contributions, count: totalCount } =
        await this.contributionModel.findAndCountAll({
          where,
          include: [
            { model: User, as: 'user' },
            { model: Project, as: 'project' },
            { association: 'transactions' },
          ],
          limit: limit + 1, // Fetch one extra to determine hasNextPage
          offset,
          order: [['createdAt', 'DESC']], // Most recent first
        });

      // Calculate total amount for all matching contributions (without pagination)
      const totalAmountResult = await this.contributionModel.findAll({
        where,
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        ],
        raw: true,
      });

      const totalAmount = Number((totalAmountResult[0] as any)?.totalAmount || 0);

      // Determine if there are more pages
      const hasNextPage = contributions.length > limit;
      const items = hasNextPage ? contributions.slice(0, limit) : contributions;

      // Build edges with cursors
      const edges: ContributionEdge[] = items.map((contribution, index) => ({
        node: contribution,
        cursor: this.encodeCursor(offset + index),
      }));

      // Build page info
      const pageInfo: PageInfo = {
        hasNextPage,
        hasPreviousPage: offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      };

      this.logger.log(
        `Fetched ${items.length} contributions (total: ${totalCount}, amount: ${totalAmount})`
      );

      return {
        edges,
        pageInfo,
        totalCount,
        totalAmount,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch contributions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get contributions for a specific user
   * @param userId - User ID to filter by
   * @param filter - Additional filter criteria
   * @param pagination - Pagination parameters
   * @returns Paginated contributions for the user
   */
  async getUserContributions(
    userId: string,
    filter: ContributionFilter = {},
    pagination: PaginationInput = {}
  ): Promise<ContributionConnection> {
    this.logger.log(`Fetching contributions for user ${userId}`);

    // Validate user exists
    await this.validateUser(userId);

    // Add userId to filter
    const userFilter: ContributionFilter = {
      ...filter,
      userId,
    };

    return this.getContributions(userFilter, pagination);
  }

  /**
   * Get contributions for a specific project
   * @param projectId - Project ID to filter by
   * @param filter - Additional filter criteria
   * @param pagination - Pagination parameters
   * @returns Paginated contributions for the project
   */
  async getProjectContributions(
    projectId: string,
    filter: ContributionFilter = {},
    pagination: PaginationInput = {}
  ): Promise<ContributionConnection> {
    this.logger.log(`Fetching contributions for project ${projectId}`);

    // Validate project exists
    const project = await this.projectModel.findByPk(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Add projectId to filter
    const projectFilter: ContributionFilter = {
      ...filter,
      projectId,
    };

    return this.getContributions(projectFilter, pagination);
  }

  /**
   * Build Sequelize where clause from filter input
   * @param filter - Filter criteria
   * @returns Sequelize where options
   */
  private buildWhereClause(filter: ContributionFilter): WhereOptions {
    const where: any = {};

    // Filter by payment status
    if (filter.paymentStatus) {
      where.paymentStatus = filter.paymentStatus;
    }

    // Filter by project ID
    if (filter.projectId) {
      where.projectId = filter.projectId;
    }

    // Filter by user ID
    if (filter.userId) {
      where.userId = filter.userId;
    }

    // Filter by date range
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt[Op.gte] = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt[Op.lte] = new Date(filter.endDate);
      }
    }

    // Filter by amount range
    if (filter.minAmount || filter.maxAmount) {
      where.amount = {};
      if (filter.minAmount) {
        where.amount[Op.gte] = filter.minAmount;
      }
      if (filter.maxAmount) {
        where.amount[Op.lte] = filter.maxAmount;
      }
    }

    // Search by contributor name or email
    if (filter.search) {
      // Note: This requires a join with the User table
      // We'll use Sequelize's include with where clause
      where[Op.or] = [
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('user.firstName')),
          Op.like,
          `%${filter.search.toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('user.lastName')),
          Op.like,
          `%${filter.search.toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('user.email')),
          Op.like,
          `%${filter.search.toLowerCase()}%`
        ),
      ];
    }

    return where;
  }

  /**
   * Calculate offset from pagination input
   * @param pagination - Pagination parameters
   * @returns Offset value
   */
  private calculateOffset(pagination: PaginationInput): number {
    if (pagination.after) {
      // Decode cursor to get offset
      return this.decodeCursor(pagination.after) + 1;
    }

    if (pagination.before) {
      // For backward pagination
      const beforeOffset = this.decodeCursor(pagination.before);
      const limit = pagination.last || 20;
      return Math.max(0, beforeOffset - limit);
    }

    return 0;
  }

  /**
   * Encode offset as cursor (base64)
   * @param offset - Offset value
   * @returns Base64 encoded cursor
   */
  private encodeCursor(offset: number): string {
    return Buffer.from(`cursor:${offset}`).toString('base64');
  }

  /**
   * Decode cursor to offset
   * @param cursor - Base64 encoded cursor
   * @returns Offset value
   */
  private decodeCursor(cursor: string): number {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const offset = parseInt(decoded.split(':')[1], 10);
      return isNaN(offset) ? 0 : offset;
    } catch {
      this.logger.warn(`Failed to decode cursor: ${cursor}`);
      return 0;
    }
  }

  /**
   * Admin creates a contribution for any user with specified status
   * @param input - Admin contribution creation data
   * @param adminUserId - Admin user ID (for audit logging)
   * @returns Created contribution
   */
  async adminCreateContribution(
    input: AdminCreateContributionInput,
    adminUserId?: string
  ): Promise<Contribution> {
    this.logger.log(
      `Admin creating contribution for user ${input.userId}, project ${input.projectId}, status ${input.paymentStatus}`
    );

    // Validate user exists
    await this.validateUser(input.userId);

    // Validate project exists and is active
    await this.validateProject(input.projectId);

    // Validate amount
    this.validateAmount(input.amount);

    // Start database transaction for atomicity
    const transaction = await this.sequelize.transaction();

    try {
      // Create contribution with specified status
      const contribution = await this.contributionModel.create(
        {
          userId: input.userId,
          projectId: input.projectId,
          amount: input.amount,
          paymentStatus: input.paymentStatus,
          notes: input.notes,
          paymentReference: input.paymentReference,
          paidAt: input.paymentStatus === PaymentStatus.PAID ? new Date() : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction }
      );

      // If status is paid, update project amount
      if (input.paymentStatus === PaymentStatus.PAID) {
        await this.updateProjectAmount(
          input.projectId,
          input.amount,
          'add',
          transaction
        );
      }

      // Create audit log for admin creation
      await this.createAuditLog(
        contribution.id,
        'none', // No previous status for new contributions
        input.paymentStatus,
        `Admin created contribution with status ${input.paymentStatus}`,
        adminUserId,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      this.logger.log(`Admin contribution ${contribution.id} created successfully`);

      // Load relationships for return
      const createdContribution = await this.getContributionById(contribution.id);

      // Send confirmation email if requested
      if (input.sendEmail) {
        this.emailService
          .sendAdminContributionConfirmationEmail(createdContribution)
          .catch((error) => {
            this.logger.error(
              `Failed to send admin contribution confirmation email: ${error.message}`,
              error.stack
            );
          });
      }

      return createdContribution;
    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();

      this.logger.error(
        `Failed to create admin contribution: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Update contribution status with audit logging
   * @param contributionId - Contribution ID
   * @param newStatus - New payment status
   * @param reason - Reason for status change
   * @param adminUserId - Admin user ID (for audit logging)
   * @returns Updated contribution
   * @throws NotFoundException if contribution not found
   * @throws UnprocessableEntityException if status change would make project amount negative
   */
  async updateContributionStatus(
    contributionId: string,
    newStatus: PaymentStatus,
    reason?: string,
    adminUserId?: string
  ): Promise<Contribution> {
    this.logger.log(
      `Updating contribution ${contributionId} status to ${newStatus}`
    );

    // Get contribution with relationships
    const contribution = await this.getContributionById(contributionId);
    const previousStatus = contribution.paymentStatus;

    // If status hasn't changed, return early
    if (previousStatus === newStatus) {
      this.logger.log(`Contribution ${contributionId} already has status ${newStatus}`);
      return contribution;
    }

    // Start database transaction for atomicity
    const transaction = await this.sequelize.transaction();

    try {
      // Calculate project amount changes based on status transition
      const amountChange = this.calculateAmountChange(
        previousStatus,
        newStatus,
        contribution.amount
      );

      // If there's an amount change, validate and update project
      if (amountChange !== 0) {
        const operation = amountChange > 0 ? 'add' : 'subtract';
        const absoluteAmount = Math.abs(amountChange);

        await this.updateProjectAmount(
          contribution.projectId,
          absoluteAmount,
          operation,
          transaction
        );
      }

      // Update contribution status
      const updateData: any = {
        paymentStatus: newStatus,
        updatedAt: new Date(),
      };

      // Set paidAt timestamp when transitioning to paid
      if (newStatus === PaymentStatus.PAID && !contribution.paidAt) {
        updateData.paidAt = new Date();
      }

      // Clear paidAt when transitioning away from paid
      if (previousStatus === PaymentStatus.PAID && newStatus !== PaymentStatus.PAID) {
        updateData.paidAt = null;
      }

      await contribution.update(updateData, { transaction });

      // Create audit log entry
      await this.createAuditLog(
        contributionId,
        previousStatus,
        newStatus,
        reason || `Status changed from ${previousStatus} to ${newStatus}`,
        adminUserId,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      this.logger.log(
        `Contribution ${contributionId} status updated: ${previousStatus} -> ${newStatus}`
      );

      // Reload contribution with updated relationships
      return await this.getContributionById(contributionId);
    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();

      this.logger.error(
        `Failed to update contribution status: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Process refund for a paid contribution
   * @param contributionId - Contribution ID
   * @param reason - Reason for refund
   * @param adminUserId - Admin user ID (for audit logging)
   * @returns Updated contribution with refunded status
   * @throws NotFoundException if contribution not found
   * @throws UnprocessableEntityException if contribution is not paid
   */
  async processRefund(
    contributionId: string,
    reason: string,
    adminUserId?: string
  ): Promise<Contribution> {
    this.logger.log(`Processing refund for contribution ${contributionId}`);

    // Get contribution with relationships
    const contribution = await this.getContributionById(contributionId);

    // Validate contribution is in paid status
    if (contribution.paymentStatus !== PaymentStatus.PAID) {
      throw new UnprocessableEntityException(
        `Cannot process refund for contribution with status ${contribution.paymentStatus}. Only paid contributions can be refunded.`
      );
    }

    // Get the original payment transaction to get the gateway transaction ID
    const transactions = await this.transactionService.getContributionTransactions(
      contributionId
    );

    const originalPaymentTransaction = transactions.find(
      (t) => t.transactionType === 'payment' && t.status === 'success'
    );

    if (!originalPaymentTransaction || !originalPaymentTransaction.gatewayTransactionId) {
      throw new UnprocessableEntityException(
        `Cannot process refund: No successful payment transaction found for contribution ${contributionId}`
      );
    }

    // Start database transaction for atomicity
    const transaction = await this.sequelize.transaction();

    try {
      // Process refund through transaction service
      const refundResult = await this.transactionService.processRefund(
        contributionId,
        contribution.amount,
        originalPaymentTransaction.gatewayTransactionId,
        reason
      );

      if (refundResult.success) {
        // Update contribution status to refunded
        await contribution.update(
          {
            paymentStatus: PaymentStatus.REFUNDED,
            updatedAt: new Date(),
          },
          { transaction }
        );

        // Decrease project amount
        await this.updateProjectAmount(
          contribution.projectId,
          contribution.amount,
          'subtract',
          transaction
        );

        // Create audit log entry
        await this.createAuditLog(
          contributionId,
          PaymentStatus.PAID,
          PaymentStatus.REFUNDED,
          reason,
          adminUserId,
          transaction
        );

        // Commit transaction
        await transaction.commit();

        this.logger.log(`Refund processed successfully for contribution ${contributionId}`);

        // Send refund email (async, don't wait)
        this.emailService
          .sendRefundNotificationEmail(contribution, reason)
          .catch((error) => {
            this.logger.error(
              `Failed to send refund email for contribution ${contributionId}: ${error.message}`,
              error.stack
            );
          });

        // Reload contribution with updated relationships
        return await this.getContributionById(contributionId);
      } else {
        // Refund failed - rollback transaction
        await transaction.rollback();

        this.logger.warn(
          `Refund failed for contribution ${contributionId}: ${refundResult.errorMessage}`
        );

        throw new UnprocessableEntityException(
          `Refund processing failed: ${refundResult.errorMessage}`
        );
      }
    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();

      this.logger.error(
        `Error processing refund for contribution ${contributionId}: ${error.message}`,
        error.stack
      );

      throw error;
    }
  }

  /**
   * Bulk update contribution statuses
   * @param contributionIds - Array of contribution IDs
   * @param newStatus - New payment status
   * @param reason - Reason for status change
   * @param adminUserId - Admin user ID (for audit logging)
   * @returns Result with success/failure counts
   */
  async bulkUpdateContributionStatus(
    contributionIds: string[],
    newStatus: PaymentStatus,
    reason?: string,
    adminUserId?: string
  ): Promise<BulkUpdateResult> {
    this.logger.log(
      `Bulk updating ${contributionIds.length} contributions to status ${newStatus}`
    );

    let successCount = 0;
    let failureCount = 0;
    const errors: BulkUpdateError[] = [];

    // Process each contribution individually
    // Note: We don't use a single transaction for all updates because
    // we want partial success - some updates may succeed while others fail
    for (const contributionId of contributionIds) {
      try {
        await this.updateContributionStatus(
          contributionId,
          newStatus,
          reason,
          adminUserId
        );
        successCount++;
      } catch (error) {
        failureCount++;
        errors.push({
          contributionId,
          error: error.message,
        });
        this.logger.warn(
          `Failed to update contribution ${contributionId}: ${error.message}`
        );
      }
    }

    this.logger.log(
      `Bulk update completed: ${successCount} succeeded, ${failureCount} failed`
    );

    return {
      successCount,
      failureCount,
      errors,
    };
  }

  /**
   * Create an audit log entry for a contribution status change
   * @param contributionId - Contribution ID
   * @param previousStatus - Previous payment status
   * @param newStatus - New payment status
   * @param reason - Reason for change
   * @param adminUserId - Admin user ID
   * @param transaction - Database transaction
   */
  private async createAuditLog(
    contributionId: string,
    previousStatus: string,
    newStatus: string,
    reason: string,
    adminUserId?: string,
    transaction?: import('sequelize').Transaction
  ): Promise<void> {
    this.logger.log(`Creating audit log for contribution ${contributionId}`);

    try {
      await this.auditLogModel.create(
        {
          contributionId,
          adminUserId,
          previousStatus,
          newStatus,
          reason,
          createdAt: new Date(),
        } as any,
        { transaction }
      );

      this.logger.log(`Audit log created for contribution ${contributionId}`);
    } catch (error) {
      this.logger.error(
        `Failed to create audit log for contribution ${contributionId}: ${error.message}`,
        error.stack
      );
      // Re-throw to ensure transaction rollback
      throw error;
    }
  }

  /**
   * Calculate the project amount change based on status transition
   * @param previousStatus - Previous payment status
   * @param newStatus - New payment status
   * @param amount - Contribution amount
   * @returns Amount change (positive for increase, negative for decrease, 0 for no change)
   */
  private calculateAmountChange(
    previousStatus: PaymentStatus,
    newStatus: PaymentStatus,
    amount: number
  ): number {
    // Status transitions that increase project amount
    if (previousStatus === PaymentStatus.PENDING && newStatus === PaymentStatus.PAID) {
      return amount; // Add amount
    }

    if (previousStatus === PaymentStatus.FAILED && newStatus === PaymentStatus.PAID) {
      return amount; // Add amount
    }

    // Status transitions that decrease project amount
    if (previousStatus === PaymentStatus.PAID && newStatus === PaymentStatus.REFUNDED) {
      return -amount; // Subtract amount
    }

    if (previousStatus === PaymentStatus.PAID && newStatus === PaymentStatus.FAILED) {
      return -amount; // Subtract amount
    }

    if (previousStatus === PaymentStatus.PAID && newStatus === PaymentStatus.PENDING) {
      return -amount; // Subtract amount
    }

    // No amount change for other transitions
    return 0;
  }

  /**
   * Generate contribution report based on report type
   * @param reportType - Type of report to generate
   * @param filter - Optional filters to apply
   * @returns Contribution report with aggregated data
   */
  async generateReport(
    reportType: ReportType,
    filter: ReportFilter = {}
  ): Promise<ContributionReport> {
    this.logger.log(`Generating ${reportType} report`);

    try {
      // Get summary report (always needed for base statistics)
      const summaryReport = await this.getSummaryReport(filter);

      // Get additional data based on report type
      let topProjects: ProjectContributionSummary[] = [];
      let topContributors: UserContributionSummary[] = [];
      let timeSeriesData: TimeSeriesPoint[] = [];

      switch (reportType) {
        case ReportType.SUMMARY:
          // Get top projects and contributors for summary
          topProjects = await this.getProjectReport(filter, 10);
          topContributors = await this.getContributorReport(filter, 10);
          break;

        case ReportType.BY_PROJECT:
          // Get all projects (no limit)
          topProjects = await this.getProjectReport(filter);
          break;

        case ReportType.BY_USER:
          // Get all contributors (no limit)
          topContributors = await this.getContributorReport(filter);
          break;

        case ReportType.TIME_SERIES:
          // Get time series data (default to daily aggregation)
          timeSeriesData = await this.getTimeSeriesReport(filter, 'day');
          break;
      }

      return {
        ...summaryReport,
        topProjects,
        topContributors,
        timeSeriesData,
      };
    } catch (error) {
      this.logger.error(`Failed to generate report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get summary report with totals by status and success rate
   * @param filter - Optional filters to apply
   * @returns Summary statistics
   */
  private async getSummaryReport(
    filter: ReportFilter = {}
  ): Promise<Omit<ContributionReport, 'topProjects' | 'topContributors' | 'timeSeriesData'>> {
    this.logger.log('Generating summary report');

    // Build where clause from filter
    const where = this.buildReportWhereClause(filter);

    // Get contributions grouped by status
    const statusGroups = await this.contributionModel.findAll({
      where,
      attributes: [
        'paymentStatus',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
      ],
      group: ['paymentStatus'],
      raw: true,
    });

    // Initialize counters
    let totalContributions = 0;
    let totalAmount = 0;
    let pendingCount = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let paidAmount = 0;
    let failedCount = 0;
    let failedAmount = 0;
    let refundedCount = 0;
    let refundedAmount = 0;

    // Aggregate results by status
    for (const group of statusGroups as any[]) {
      const count = parseInt(group.count, 10);
      const amount = parseFloat(group.totalAmount || '0');

      totalContributions += count;
      totalAmount += amount;

      switch (group.paymentStatus) {
        case PaymentStatus.PENDING:
          pendingCount = count;
          pendingAmount = amount;
          break;
        case PaymentStatus.PAID:
          paidCount = count;
          paidAmount = amount;
          break;
        case PaymentStatus.FAILED:
          failedCount = count;
          failedAmount = amount;
          break;
        case PaymentStatus.REFUNDED:
          refundedCount = count;
          refundedAmount = amount;
          break;
      }
    }

    // Calculate success rate: (paid count / total count) * 100
    const successRate = totalContributions > 0 ? (paidCount / totalContributions) * 100 : 0;

    this.logger.log(
      `Summary report: ${totalContributions} contributions, ${totalAmount} total, ${successRate.toFixed(2)}% success rate`
    );

    return {
      totalContributions,
      totalAmount,
      pendingCount,
      pendingAmount,
      paidCount,
      paidAmount,
      failedCount,
      failedAmount,
      refundedCount,
      refundedAmount,
      successRate,
    };
  }

  /**
   * Get contribution totals per project
   * @param filter - Optional filters to apply
   * @param limit - Optional limit for top N projects
   * @returns Project contribution summaries ordered by total amount descending
   */
  private async getProjectReport(
    filter: ReportFilter = {},
    limit?: number
  ): Promise<ProjectContributionSummary[]> {
    this.logger.log(`Generating project report${limit ? ` (top ${limit})` : ''}`);

    // Build where clause from filter
    const where = this.buildReportWhereClause(filter);

    // Get contributions grouped by project
    const projectGroups = await this.contributionModel.findAll({
      where,
      attributes: [
        'projectId',
        [Sequelize.fn('COUNT', Sequelize.col('Contribution.id')), 'contributionCount'],
        [Sequelize.fn('SUM', Sequelize.col('Contribution.amount')), 'totalAmount'],
      ],
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['title'],
        },
      ],
      group: ['projectId', 'project.id', 'project.title'],
      order: [[Sequelize.literal('totalAmount'), 'DESC']],
      limit,
      raw: false,
    });

    // Map to ProjectContributionSummary
    const summaries: ProjectContributionSummary[] = projectGroups.map((group: any) => ({
      projectId: group.projectId,
      projectTitle: group.project?.title || 'Unknown Project',
      contributionCount: parseInt(group.getDataValue('contributionCount'), 10),
      totalAmount: parseFloat(group.getDataValue('totalAmount') || '0'),
    }));

    this.logger.log(`Project report: ${summaries.length} projects`);

    return summaries;
  }

  /**
   * Get contribution totals per user
   * @param filter - Optional filters to apply
   * @param limit - Optional limit for top N contributors
   * @returns User contribution summaries ordered by total amount descending
   */
  private async getContributorReport(
    filter: ReportFilter = {},
    limit?: number
  ): Promise<UserContributionSummary[]> {
    this.logger.log(`Generating contributor report${limit ? ` (top ${limit})` : ''}`);

    // Build where clause from filter
    const where = this.buildReportWhereClause(filter);

    // Get contributions grouped by user
    const userGroups = await this.contributionModel.findAll({
      where,
      attributes: [
        'userId',
        [Sequelize.fn('COUNT', Sequelize.col('Contribution.id')), 'contributionCount'],
        [Sequelize.fn('SUM', Sequelize.col('Contribution.amount')), 'totalAmount'],
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      group: ['userId', 'user.id', 'user.firstName', 'user.lastName', 'user.email'],
      order: [[Sequelize.literal('totalAmount'), 'DESC']],
      limit,
      raw: false,
    });

    // Map to UserContributionSummary
    const summaries: UserContributionSummary[] = userGroups.map((group: any) => {
      const user = group.user;
      const userName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : 'Unknown User';

      return {
        userId: group.userId,
        userName,
        userEmail: user?.email || '',
        contributionCount: parseInt(group.getDataValue('contributionCount'), 10),
        totalAmount: parseFloat(group.getDataValue('totalAmount') || '0'),
      };
    });

    this.logger.log(`Contributor report: ${summaries.length} contributors`);

    return summaries;
  }

  /**
   * Get time series data aggregated by period
   * @param filter - Optional filters to apply
   * @param period - Aggregation period (day, week, month)
   * @returns Time series points ordered by date ascending
   */
  private async getTimeSeriesReport(
    filter: ReportFilter = {},
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesPoint[]> {
    this.logger.log(`Generating time series report (period: ${period})`);

    // Build where clause from filter
    const where = this.buildReportWhereClause(filter);

    // Determine date truncation function based on database dialect
    const dialect = this.sequelize.getDialect();
    let dateTrunc: any;

    if (dialect === 'postgres') {
      dateTrunc = Sequelize.fn('DATE_TRUNC', period, Sequelize.col('createdAt'));
    } else if (dialect === 'mysql' || dialect === 'mariadb') {
      // MySQL date truncation
      if (period === 'day') {
        dateTrunc = Sequelize.fn('DATE', Sequelize.col('createdAt'));
      } else if (period === 'week') {
        dateTrunc = Sequelize.fn(
          'DATE_SUB',
          Sequelize.fn('DATE', Sequelize.col('createdAt')),
          Sequelize.literal(`INTERVAL WEEKDAY(createdAt) DAY`)
        );
      } else {
        // month
        dateTrunc = Sequelize.fn(
          'DATE_FORMAT',
          Sequelize.col('createdAt'),
          '%Y-%m-01'
        );
      }
    } else {
      // SQLite and others - use date function
      dateTrunc = Sequelize.fn('DATE', Sequelize.col('createdAt'));
    }

    // Get contributions grouped by date period
    const timeGroups = await this.contributionModel.findAll({
      where,
      attributes: [
        [dateTrunc, 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'contributionCount'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
      ],
      group: [Sequelize.literal('1') as any], // Group by first column (date)
      order: [[Sequelize.literal('1') as any, 'ASC']], // Order by date ascending
      raw: true,
    });

    // Map to TimeSeriesPoint
    const points: TimeSeriesPoint[] = (timeGroups as any[]).map((group) => ({
      date: this.formatDate(group.date),
      contributionCount: parseInt(group.contributionCount, 10),
      totalAmount: parseFloat(group.totalAmount || '0'),
    }));

    this.logger.log(`Time series report: ${points.length} data points`);

    return points;
  }

  /**
   * Build where clause for report queries from filter
   * @param filter - Report filter
   * @returns Sequelize where options
   */
  private buildReportWhereClause(filter: ReportFilter): WhereOptions {
    const where: any = {};

    // Filter by project ID
    if (filter.projectId) {
      where.projectId = filter.projectId;
    }

    // Filter by user ID
    if (filter.userId) {
      where.userId = filter.userId;
    }

    // Filter by date range
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt[Op.gte] = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt[Op.lte] = new Date(filter.endDate);
      }
    }

    return where;
  }

  /**
   * Format date for time series output
   * @param date - Date to format
   * @returns ISO date string (YYYY-MM-DD)
   */
  private formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      // Already formatted or needs parsing
      const parsed = new Date(date);
      return parsed.toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  }
}
