import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Models
import { Contribution } from './contribution.model';
import { Transaction } from './transaction.model';
import { ContributionAuditLog } from './audit-log.model';
import { Project } from '../project/project.model';
import { User } from '../user/user.model';

// Services
import { ContributionService } from './contribution.service';
import { TransactionService } from './transaction.service';

// Resolvers
import { ContributionResolver } from './contribution.resolver';

// External Modules
import { PaymentModule } from '../payment/payment.module';
import { ProjectModule } from '../project/project.module';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { ActivityModule } from '../activity/activity.module';

// Event Listeners
import { ContributionEventListener } from './contribution.event-listener';

/**
 * Contribution Module
 * Manages financial contributions to projects including payment processing,
 * transaction logging, and comprehensive reporting capabilities.
 */
@Module({
  imports: [
    SequelizeModule.forFeature([
      Contribution,
      Transaction,
      ContributionAuditLog,
      Project,
      User,
    ]),
    PaymentModule,
    ProjectModule,
    UserModule,
    EmailModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    ContributionService,
    TransactionService,
    ContributionResolver,
    ContributionEventListener,
  ],
  exports: [ContributionService],
})
export class ContributionModule {}
