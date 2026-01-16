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
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Contribution } from './contribution.model';
import { User } from '../user/user.model';

@ObjectType()
@Table({
  tableName: 'contribution_audit_logs',
  underscored: true,
  timestamps: false,
})
export class ContributionAuditLog extends Model<ContributionAuditLog> {
  @Field(() => ID)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Contribution)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'contribution_id',
  })
  contributionId: string;

  @Field(() => Contribution)
  @BelongsTo(() => Contribution)
  contribution: Contribution;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'admin_user_id',
  })
  adminUserId?: string;

  @Field(() => User, { nullable: true })
  @BelongsTo(() => User)
  adminUser?: User;

  @Field()
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'previous_status',
  })
  previousStatus: string;

  @Field()
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'new_status',
  })
  newStatus: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reason?: string;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt: Date;
}
