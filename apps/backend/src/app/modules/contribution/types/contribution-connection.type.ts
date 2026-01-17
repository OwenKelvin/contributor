import { ContributionEdge } from './contribution-edge.type';
import { PageInfo } from '../../../common/types/page-info.type';

export class ContributionConnection {
  edges: ContributionEdge[];
  pageInfo: PageInfo;
  totalCount: number;
  totalAmount: number;
}
