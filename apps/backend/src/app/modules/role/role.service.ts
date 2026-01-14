import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './role.model';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
  ) {}

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ where: { name } });
  }

  async create(name: string): Promise<Role> {
    return this.roleModel.create({ name });
  }
}
