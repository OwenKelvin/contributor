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
import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
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

registerEnumType(TransactionType, {
  name: 'TransactionType',
});

registerEnumType(TransactionStatus, {
  name: 'TransactionStatus',
});

@ObjectType()
@Table({
  tableName: 'transactions',
  underscored: true,
  timestamps: false,
})
export class Transaction extends Model<Transaction> {
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

  @Field(() => TransactionType)
  @Column({
    type: DataType.ENUM(...Object.values(TransactionType)),
    allowNull: false,
    field: 'transaction_type',
  })
  transactionType: TransactionType;

  @Field(() => Float)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Field(() => TransactionStatus)
  @Column({
    type: DataType.ENUM(...Object.values(TransactionStatus)),
    allowNull: false,
    defaultValue: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'gateway_transaction_id',
  })
  gatewayTransactionId?: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'gateway_response',
  })
  gatewayResponse?: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'error_code',
  })
  errorCode?: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'error_message',
  })
  errorMessage?: string;

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt: Date;
}
