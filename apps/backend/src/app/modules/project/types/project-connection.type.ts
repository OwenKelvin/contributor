import { ProjectEdge } from './project-edge.type';
import { PageInfo } from '../../../common/types/page-info.type';

export class ProjectConnection {
  edges: ProjectEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}
