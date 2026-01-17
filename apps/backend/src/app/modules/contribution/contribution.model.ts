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
  Pending = 'PENDING',
  Paid = 'PAID',
  Failed = 'FAILED',
  Refunded = 'REFUNDED',
}


@Table({
  tableName: 'contributions',
  underscored: true,
})
export class Contribution extends Model<IContribution> {
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

  @ForeignKey(() => Project)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'project_id',
  })
  projectId: string;

  @BelongsTo(() => Project)
  project: Project;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  })
  amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.Pending,
    field: 'payment_status',
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'payment_reference',
  })
  paymentReference?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'failure_reason',
  })
  failureReason?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'paid_at',
  })
  paidAt?: Date;

  @HasMany(() => Transaction)
  transactions: Transaction[];

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
