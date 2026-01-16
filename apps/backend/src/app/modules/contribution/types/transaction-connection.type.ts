import { ObjectType, Field, Int } from '@nestjs/graphql';
import { TransactionEdge } from './transaction-edge.type';
import { PageInfo } from '../../../common/types/page-info.type';

@ObjectType()
export class TransactionConnection {
  @Field(() => [TransactionEdge])
  edges: TransactionEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}
