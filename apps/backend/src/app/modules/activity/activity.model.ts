import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../user/user.model';

export class ActivityModel {
  id?: string;
  userId: string;
  action: ActivityAction;
  targetId: string | null;
  targetType: TargetType | null;
  details: string;
}


export enum ActivityAction {
  // User actions
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_BANNED = 'USER_BANNED',
  USER_UNBANNED = 'USER_UNBANNED',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',

  // Project actions
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  PROJECT_APPROVED = 'PROJECT_APPROVED',
  PROJECT_REJECTED = 'PROJECT_REJECTED',
  PROJECT_ARCHIVED = 'PROJECT_ARCHIVED',

  // Contribution actions
  CONTRIBUTION_CREATED = 'CONTRIBUTION_CREATED',
  CONTRIBUTION_UPDATED = 'CONTRIBUTION_UPDATED',
  CONTRIBUTION_DELETED = 'CONTRIBUTION_DELETED',

  // Role actions
  ROLE_CREATED = 'ROLE_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_DELETED = 'ROLE_DELETED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REVOKED = 'ROLE_REVOKED',

  // Permission actions
  PERMISSION_CREATED = 'PERMISSION_CREATED',
  PERMISSION_UPDATED = 'PERMISSION_UPDATED',
  PERMISSION_DELETED = 'PERMISSION_DELETED',

  // Category actions
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',
}

export enum TargetType {
  USER = 'User',
  PROJECT = 'Project',
  CONTRIBUTION = 'Contribution',
  ROLE = 'Role',
  PERMISSION = 'Permission',
  CATEGORY = 'Category',
}

@Table({
  tableName: 'activities',
  underscored: true,
})
export class Activity extends Model<ActivityModel> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.ENUM(...Object.values(ActivityAction)),
    allowNull: false,
  })
  action: ActivityAction;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'target_id',
  })
  targetId: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(TargetType)),
    allowNull: true,
    field: 'target_type',
  })
  targetType: TargetType | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
  })
  get details(): string {
    const value = this.getDataValue('details' as keyof ActivityModel);
    return value ? JSON.stringify(value) : '{}';
  }

  set details(value: string | Record<string, unknown>) {
    if (typeof value === 'string') {
      this.setDataValue('details' as keyof ActivityModel, JSON.parse(value));
    } else {
      this.setDataValue('details' as keyof ActivityModel, value as any);
    }
  }

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updatedAt: Date;
}
