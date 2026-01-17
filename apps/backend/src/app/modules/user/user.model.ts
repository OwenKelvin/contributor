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

import { hash } from 'bcryptjs';


@Table({
  tableName: 'users',
  underscored: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

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

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'first_name',
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'last_name',
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
    field: 'phone_number',
  })
  phoneNumber: string;

  @BeforeCreate
  static async hashPassword(user: User) {
    if (user.password) {
      user.password = await hash(user.password, 10);
    }
  }

  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];
}
