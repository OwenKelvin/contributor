import { UserEdge } from './user-edge.type';
import { PageInfo } from '../../../common/types/page-info.type';

export class UserConnection {
  edges: UserEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}
