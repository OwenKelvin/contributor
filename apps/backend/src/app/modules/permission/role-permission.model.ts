import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Role } from '../role/role.model';
import { Permission } from './permission.model';

@Table({
  tableName: 'role_permissions',
  underscored: true,
})
export class RolePermission extends Model<RolePermission> {
  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'role_id',
  })
  roleId: string;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'permission_id',
  })
  permissionId: string;
}
