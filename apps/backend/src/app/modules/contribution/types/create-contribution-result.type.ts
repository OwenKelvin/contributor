import { Contribution } from '../contribution.model';

export class CreateContributionResultType {
  success: boolean;
  message: string;
  data: Contribution
}
