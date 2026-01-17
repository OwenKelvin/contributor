import { ProjectStatus } from '../project.model';

export class DateRangeInput {
  start: Date;
  end: Date;
}

export class ProjectFilter {
  status?: ProjectStatus;
  categoryId?: string;
  dateRange?: DateRangeInput;
}
