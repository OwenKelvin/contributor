import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction, TransactionType, TransactionStatus } from './transaction.model';
import { PaymentGateway, PaymentDetails } from '../payment';
import { TransactionFilterInput } from './dto/transaction-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { TransactionConnection } from './types/transaction-connection.type';
import { TransactionEdge } from './types/transaction-edge.type';
import { PageInfo } from './types/page-info.type';
import { Op } from 'sequelize';

/**
 * Interface for creating a transaction
 */
export interface CreateTransactionInput {
  contributionId: string;
  transactionType: TransactionType;
  amount: number;
  status: TransactionStatus;
  gatewayTransactionId?: string;
  gatewayResponse?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Result of a transaction operation
 */
export interface TransactionResult {
  success: boolean;
  transaction: Transaction;
  gatewayTransactionId?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Transaction Service
 * Handles transaction logging and payment/refund processing through the payment gateway
 */
@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Transaction)
    private readonly transactionModel: typeof Transaction,
    @Inject('PaymentGateway')
    private readonly paymentGateway: PaymentGateway
  ) {}

  /**
   * Create a transaction log entry
   * @param data - Transaction data
   * @returns Created transaction
   */
  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    this.logger.log(`Creating transaction for contribution ${data.contributionId}`);

    try {
      const transaction = await this.transactionModel.create({
        contributionId: data.contributionId,
        transactionType: data.transactionType,
        amount: data.amount,
        status: data.status,
        gatewayTransactionId: data.gatewayTransactionId || null,
        gatewayResponse: data.gatewayResponse || null,
        errorCode: data.errorCode || null,
        errorMessage: data.errorMessage || null,
        createdAt: new Date(),
      } as any);

      this.logger.log(`Transaction ${transaction.id} created successfully`);
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process payment through the payment gateway
   * @param contributionId - Contribution ID
   * @param amount - Payment amount
   * @param paymentDetails - Payment details (phone number, etc.)
   * @returns Transaction result
   */
  async processPayment(
    contributionId: string,
    amount: number,
    paymentDetails: PaymentDetails
  ): Promise<TransactionResult> {
    this.logger.log(`Processing payment for contribution ${contributionId}, amount: ${amount}`);

    // Create initial pending transaction
    const transaction = await this.createTransaction({
      contributionId,
      transactionType: TransactionType.PAYMENT,
      amount,
      status: TransactionStatus.PENDING,
    });

    try {
      // Call payment gateway
      const paymentResult = await this.paymentGateway.processPayment(
        contributionId,
        paymentDetails
      );

      // Update transaction with gateway response
      if (paymentResult.success) {
        await transaction.update({
          status: TransactionStatus.SUCCESS,
          gatewayTransactionId: paymentResult.checkoutRequestId,
          gatewayResponse: JSON.stringify(paymentResult),
        });

        this.logger.log(`Payment processed successfully for contribution ${contributionId}`);

        return {
          success: true,
          transaction,
          gatewayTransactionId: paymentResult.checkoutRequestId,
        };
      } else {
        await transaction.update({
          status: TransactionStatus.FAILED,
          errorCode: paymentResult.errorCode,
          errorMessage: paymentResult.errorMessage,
          gatewayResponse: JSON.stringify(paymentResult),
        });

        this.logger.warn(`Payment failed for contribution ${contributionId}: ${paymentResult.errorMessage}`);

        return {
          success: false,
          transaction,
          errorCode: paymentResult.errorCode,
          errorMessage: paymentResult.errorMessage,
        };
      }
    } catch (error) {
      // Update transaction with error
      await transaction.update({
        status: TransactionStatus.FAILED,
        errorCode: 'GATEWAY_ERROR',
        errorMessage: error.message,
      });

      this.logger.error(`Payment gateway error for contribution ${contributionId}: ${error.message}`, error.stack);

      return {
        success: false,
        transaction,
        errorCode: 'GATEWAY_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Process refund through the payment gateway
   * @param contributionId - Contribution ID
   * @param amount - Refund amount
   * @param originalTransactionId - Original M-Pesa receipt number
   * @param reason - Reason for refund
   * @returns Transaction result
   */
  async processRefund(
    contributionId: string,
    amount: number,
    originalTransactionId: string,
    reason: string
  ): Promise<TransactionResult> {
    this.logger.log(`Processing refund for contribution ${contributionId}, amount: ${amount}`);

    if (!originalTransactionId) {
      throw new BadRequestException('Original transaction ID is required for refund');
    }

    // Create initial pending refund transaction
    const transaction = await this.createTransaction({
      contributionId,
      transactionType: TransactionType.REFUND,
      amount,
      status: TransactionStatus.PENDING,
    });

    try {
      // Call payment gateway
      const refundResult = await this.paymentGateway.processRefund(
        contributionId,
        amount,
        originalTransactionId,
        reason
      );

      // Update transaction with gateway response
      if (refundResult.success) {
        await transaction.update({
          status: TransactionStatus.SUCCESS,
          gatewayTransactionId: refundResult.conversationId,
          gatewayResponse: JSON.stringify(refundResult),
        });

        this.logger.log(`Refund processed successfully for contribution ${contributionId}`);

        return {
          success: true,
          transaction,
          gatewayTransactionId: refundResult.conversationId,
        };
      } else {
        await transaction.update({
          status: TransactionStatus.FAILED,
          errorCode: refundResult.errorCode,
          errorMessage: refundResult.errorMessage,
          gatewayResponse: JSON.stringify(refundResult),
        });

        this.logger.warn(`Refund failed for contribution ${contributionId}: ${refundResult.errorMessage}`);

        return {
          success: false,
          transaction,
          errorCode: refundResult.errorCode,
          errorMessage: refundResult.errorMessage,
        };
      }
    } catch (error) {
      // Update transaction with error
      await transaction.update({
        status: TransactionStatus.FAILED,
        errorCode: 'GATEWAY_ERROR',
        errorMessage: error.message,
      });

      this.logger.error(`Refund gateway error for contribution ${contributionId}: ${error.message}`, error.stack);

      return {
        success: false,
        transaction,
        errorCode: 'GATEWAY_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Get all transactions for a specific contribution
   * @param contributionId - Contribution ID
   * @returns Array of transactions ordered by creation date (newest first)
   */
  async getContributionTransactions(contributionId: string): Promise<Transaction[]> {
    this.logger.log(`Fetching transactions for contribution ${contributionId}`);

    const transactions = await this.transactionModel.findAll({
      where: { contributionId },
      order: [['createdAt', 'DESC']],
    });

    return transactions;
  }

  /**
   * Get transactions with filtering and pagination
   * @param filter - Transaction filter criteria
   * @param pagination - Pagination parameters
   * @returns Transaction connection with edges and page info
   */
  async getTransactions(
    filter: TransactionFilterInput,
    pagination: PaginationInput
  ): Promise<TransactionConnection> {
    this.logger.log('Fetching transactions with filters and pagination');

    // Build where clause
    const where: Record<string, any> = {};

    if (filter.transactionType) {
      where.transactionType = filter.transactionType;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.contributionId) {
      where.contributionId = filter.contributionId;
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt[Op.gte] = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt[Op.lte] = filter.endDate;
      }
    }

    if (filter.search) {
      where[Op.or as any] = [
        { gatewayTransactionId: { [Op.iLike]: `%${filter.search}%` } },
        { errorCode: { [Op.iLike]: `%${filter.search}%` } },
        { errorMessage: { [Op.iLike]: `%${filter.search}%` } },
      ];
    }

    // Get total count
    const totalCount = await this.transactionModel.count({ where });

    // Handle pagination
    const limit = pagination.first || 20;
    const offset = pagination.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0;

    // Fetch transactions
    const transactions = await this.transactionModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limit + 1, // Fetch one extra to determine if there's a next page
      offset,
      include: [{ association: 'contribution' }],
    });

    // Determine if there are more pages
    const hasNextPage = transactions.length > limit;
    const edges: TransactionEdge[] = transactions.slice(0, limit).map((transaction, index) => ({
      node: transaction,
      cursor: Buffer.from((offset + index).toString()).toString('base64'),
    }));

    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage: offset > 0,
      startCursor: edges.length > 0 ? edges[0].cursor : undefined,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    };

    return {
      edges,
      pageInfo,
      totalCount,
    };
  }
}
