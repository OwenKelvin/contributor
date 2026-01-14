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
import { ObjectType, Field, ID } from '@nestjs/graphql';

interface IPermission {
  name: string;
}

@ObjectType()
@Table({
  tableName: 'permissions',
  underscored: true,
})
export class Permission extends Model<IPermission> {
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

  @Field(() => [Role])
  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];
}
