import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Activity } from './activity.model';
import { ActivityService } from './activity.service';
import { ActivityResolver } from './activity.resolver';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Activity])],
  providers: [ActivityService, ActivityResolver],
  exports: [ActivityService],
})
export class ActivityModule {}
