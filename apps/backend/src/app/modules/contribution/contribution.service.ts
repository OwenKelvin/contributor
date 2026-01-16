import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Contribution, PaymentStatus } from './contribution.model';
import { Project, ProjectStatus } from '../project/project.model';
import { User } from '../user/user.model';
import { TransactionService } from './transaction.service';
import { EmailService } from '../email/email.service';
import { CreateContributionInput } from './dto/create-contribution.input';

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
}
