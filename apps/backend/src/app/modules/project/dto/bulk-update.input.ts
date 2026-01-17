import { ProjectStatus } from '../project.model';

export class BulkUpdateInput {
  status?: ProjectStatus;
  categoryId?: string;
}
