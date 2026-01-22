import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Project } from './project.model';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';
import { CategoryModule } from '../category/category.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SequelizeModule.forFeature([Project]), CategoryModule],
  providers: [ProjectService, ProjectResolver],
  exports: [ProjectService],
})
export class ProjectModule {}
