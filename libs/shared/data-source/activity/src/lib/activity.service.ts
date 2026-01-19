import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IGetActivitiesGQL,
  IGetActivityGQL,
  IGetActivityQuery,
} from './graphql/activities.generated';
import { IActivityFilter, IActivityPaginationInput } from '@nyots/data-source';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private getActivitiesGQL = inject(IGetActivitiesGQL);
  private getActivityGQL =  inject(IGetActivityGQL)
  /**
   * Get activities with optional filters and pagination
   */
  getActivities(
    filter?: IActivityFilter,
    pagination?: IActivityPaginationInput
  ) {
    return this.getActivitiesGQL
      .fetch({ variables: { filter, pagination }})
      .pipe(map((result) => result.data?.activities));
  }

  /**
   * Get a single activity by ID
   */
  getActivity(id: string): Observable<IGetActivityQuery['activity']> {
    return this.getActivityGQL
      .fetch({ variables: { id } })
      .pipe(map((result) => result.data?.activity));
  }
}
