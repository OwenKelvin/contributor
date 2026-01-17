import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { Role } from '../role/role.model';
import { RolePermission } from './role-permission.model';

interface IPermission {
  name: string;
}

@Table({
  tableName: 'permissions',
  underscored: true,
})
export class Permission extends Model<IPermission> {
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

  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];
}
