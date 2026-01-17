import { ProjectStatus } from '../project.model';

export class UpdateProjectInput {
  title?: string;
  description?: string;
  detailedDescription?: string;
  goalAmount?: number;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  featuredImage?: string;
  status?: ProjectStatus;
}