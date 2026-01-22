import { Injectable } from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, TargetType } from '../activity/activity.model';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './role.model';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
    private activityService: ActivityService,
  ) {}

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ where: { name } });
  }

  async create(name: string, userId: string): Promise<Role> {
    const role = await this.roleModel.create({ name });
    await this.activityService.logActivity({
      userId,
      action: ActivityAction.ROLE_CREATED,
      targetType: TargetType.ROLE,
      targetId: role.id,
      details: JSON.stringify({ name: role.name })
    });
    return role;
  }

  async update(id: string, name: string, userId: string): Promise<Role> {
    const role = await this.roleModel.findByPk(id);
    if (!role) throw new Error('Role not found');
    await role.update({ name });
    await this.activityService.logActivity({
      userId,
      action: ActivityAction.ROLE_UPDATED,
      targetType: TargetType.ROLE,
      targetId: role.id,
      details: JSON.stringify({ name: role.name })
    });
    return role;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const role = await this.roleModel.findByPk(id);
    if (!role) throw new Error('Role not found');
    await role.destroy();
    await this.activityService.logActivity({
      userId,
      action: ActivityAction.ROLE_DELETED,
      targetType: TargetType.ROLE,
      targetId: id,
      details: JSON.stringify({ name: role.name })
    });
    return true;
  }
}
