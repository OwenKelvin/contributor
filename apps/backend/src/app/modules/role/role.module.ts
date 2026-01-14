import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './role.model';
import { RoleService } from './role.service';
import { UserRole } from './user-role.model';

@Module({
  imports: [SequelizeModule.forFeature([Role, UserRole])],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
