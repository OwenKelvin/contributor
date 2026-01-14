import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  BeforeCreate,
  BelongsToMany,
} from 'sequelize-typescript';
import { Role } from '../role/role.model';
import { UserRole } from '../role/user-role.model';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { hash } from 'bcryptjs';

@ObjectType()
@Table({
  tableName: 'users',
  underscored: true,
})
export class User extends Model<User> {
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
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password?: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'first_name',
  })
  firstName: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'last_name',
  })
  lastName: string;

  @BeforeCreate
  static async hashPassword(user: User) {
    if (user.password) {
      user.password = await hash(user.password, 10);
    }
  }

  @Field(() => [Role])
  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];
}
