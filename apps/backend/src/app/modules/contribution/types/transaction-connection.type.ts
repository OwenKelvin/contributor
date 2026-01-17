import { TransactionEdge } from './transaction-edge.type';
import { PageInfo } from '../../../common/types/page-info.type';

export class TransactionConnection {
  edges: TransactionEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}
