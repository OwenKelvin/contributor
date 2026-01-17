import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { Permission } from '../permission/permission.model';
import { RolePermission } from '../permission/role-permission.model';
import { User } from '../user/user.model';
import { UserRole } from './user-role.model';

interface IRole {
  id?: string;
  name: string;
  description?: string;
}

@Table({
  tableName: 'roles',
  underscored: true,
})
export class Role extends Model<IRole> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @BelongsToMany(() => User, () => UserRole)
  users: User[];

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];
}
