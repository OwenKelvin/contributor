import { Module } from '@nestjs/common';
import { GraphqlModule } from './modules/graphql/graphql.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { QueueModule } from './modules/queue/queue.module';
import { ProjectModule } from './modules/project/project.module';
import { CategoryModule } from './modules/category/category.module';
import { FileModule } from './modules/file/file.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ContributionModule } from './modules/contribution/contribution.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ActivityModule } from './modules/activity/activity.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    GraphqlModule,
    DatabaseModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    EmailModule,
    QueueModule,
    ProjectModule,
    CategoryModule,
    FileModule,
    PaymentModule,
    ContributionModule,
    DashboardModule,
    ActivityModule,
    HealthModule,
  ],
})
export class AppModule {}
