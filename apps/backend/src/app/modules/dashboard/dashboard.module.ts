import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardResolver } from './dashboard.resolver';
import { DashboardService } from './dashboard.service';
import { User } from '../user/user.model';
import { Project } from '../project/project.model';
import { Contribution } from '../contribution/contribution.model';
import { Transaction } from '../contribution/transaction.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Project, Contribution, Transaction]),
  ],
  providers: [DashboardResolver, DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
