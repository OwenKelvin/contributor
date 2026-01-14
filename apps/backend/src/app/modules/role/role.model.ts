import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { Permission } from '../permission/permission.model';
import { RolePermission } from '../permission/role-permission.model';
import { User } from '../user/user.model';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserRole } from './user-role.model';

interface IRole {
  name: string;
}

@ObjectType()
@Table({
  tableName: 'roles',
  underscored: true,
})
export class Role extends Model<IRole> {
  @Field(() => ID)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Field(() => [User])
  @BelongsToMany(() => User, () => UserRole)
  users: User[];

  @Field(() => [Permission])
  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];
}
