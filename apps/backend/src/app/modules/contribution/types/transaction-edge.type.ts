import { ObjectType, Field } from '@nestjs/graphql';
import { Transaction } from '../transaction.model';

@ObjectType()
export class TransactionEdge {
  @Field(() => Transaction)
  node: Transaction;

  @Field(() => String)
  cursor: string;
}
