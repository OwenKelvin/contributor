import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { Role } from '../role/role.model';
import { UserRole } from '../role/user-role.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserRole)
    private userRoleModel: typeof UserRole,
  ) {}

  async create(userData: Partial<User> & { roles?: Role[] }): Promise<User> {
    const user = await this.userModel.create(userData as User);

    if (userData.roles && userData.roles.length > 0) {
      await user.$set('roles', userData.roles);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
    });
  }
}
