import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from './permission.model';
import { PermissionService } from './permission.service';
import { RolePermission } from './role-permission.model';

@Module({
  imports: [SequelizeModule.forFeature([Permission, RolePermission])],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
