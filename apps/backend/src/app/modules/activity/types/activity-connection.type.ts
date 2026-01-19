import { Activity } from '../activity.model';

export class PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export class ActivityEdge {
  node: Activity;
  cursor: string;
}

export class ActivityConnection {
  edges: ActivityEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}
