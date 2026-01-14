import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from './permission.model';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission)
    private permissionModel: typeof Permission,
  ) {}

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionModel.findOne({ where: { name } });
  }

  async create(name: string): Promise<Permission> {
    return this.permissionModel.create({ name });
  }
}
