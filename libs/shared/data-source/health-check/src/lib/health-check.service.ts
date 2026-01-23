import { inject, Injectable } from '@angular/core';
import { IHealthChecksGQL } from './graphql/health-check.generated';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IHealthCheck } from '@nyots/data-source';

@Injectable({
  providedIn: 'root',
})
export class HealthCheckService {
  healthChecksGQL = inject(IHealthChecksGQL);

  getHealthChecks() {
    return this.healthChecksGQL.watch().valueChanges.pipe(
      map(result => result.data?.healthChecks)
    );
  }
}
