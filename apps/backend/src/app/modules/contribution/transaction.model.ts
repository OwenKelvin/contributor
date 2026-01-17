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
import { Contribution } from './contribution.model';

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}


@Table({
  tableName: 'transactions',
  underscored: true,
  timestamps: false,
})
export class Transaction extends Model<Transaction> {
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

  @BelongsTo(() => Contribution)
  contribution: Contribution;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionType)),
    allowNull: false,
    field: 'transaction_type',
  })
  transactionType: TransactionType;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionStatus)),
    allowNull: false,
    defaultValue: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'gateway_transaction_id',
  })
  gatewayTransactionId?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'gateway_response',
  })
  gatewayResponse?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'error_code',
  })
  errorCode?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'error_message',
  })
  errorMessage?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt: Date;
}
