import { Project } from '../project.model';
import { PageInfo } from '../../../common/types/page-info.type';

export class ProjectConnection {
  projects: Project[];
  pageInfo: PageInfo;
}
