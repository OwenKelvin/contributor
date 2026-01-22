import { Injectable } from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, TargetType } from '../activity/activity.model';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from './permission.model';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission)
    private permissionModel: typeof Permission,
    private activityService: ActivityService,
  ) {}

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionModel.findOne({ where: { name } });
  }

  async create(name: string, userId: string): Promise<Permission> {
    const permission = await this.permissionModel.create({ name });
    await this.activityService.logActivity({
      userId,
      action: ActivityAction.PERMISSION_CREATED,
      targetType: TargetType.PERMISSION,
      targetId: permission.id,
      details: JSON.stringify({ name: permission.name })
    });
    return permission;
  }

  async update(id: string, name: string, userId: string): Promise<Permission> {
    const permission = await this.permissionModel.findByPk(id);
    if (!permission) throw new Error('Permission not found');
    await permission.update({ name });
    await this.activityService.logActivity({
      userId,
      action: ActivityAction.PERMISSION_UPDATED,
      targetType: TargetType.PERMISSION,
      targetId: permission.id,
      details: JSON.stringify({ name: permission.name })
    });
    return permission;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const permission = await this.permissionModel.findByPk(id);
    if (!permission) throw new Error('Permission not found');
    await permission.destroy();
    await this.activityService.logActivity({
      userId,
      action: ActivityAction.PERMISSION_DELETED,
      targetType: TargetType.PERMISSION,
      targetId: id,
      details: JSON.stringify({ name: permission.name })
    });
    return true;
  }
}
