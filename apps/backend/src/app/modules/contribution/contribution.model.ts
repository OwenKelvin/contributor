import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { Project } from '../project/project.model';
import { Transaction } from './transaction.model';

export class IContribution {
  userId: string;
  projectId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  paymentReference?: string;
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

@ObjectType()
@Table({
  tableName: 'contributions',
  underscored: true,
})
export class Contribution extends Model<IContribution> {
  @Field(() => ID)
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

  @Field(() => User)
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'project_id',
  })
  projectId: string;

  @Field(() => Project)
  @BelongsTo(() => Project)
  project: Project;

  @Field(() => Float)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  })
  amount: number;

  @Field(() => PaymentStatus)
  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
    field: 'payment_status',
  })
  paymentStatus: PaymentStatus;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'payment_reference',
  })
  paymentReference?: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'failure_reason',
  })
  failureReason?: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'paid_at',
  })
  paidAt?: Date;

  @Field(() => [Transaction])
  @HasMany(() => Transaction)
  transactions: Transaction[];

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt: Date;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updatedAt: Date;
}
