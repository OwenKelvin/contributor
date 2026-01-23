import * as Types from '@nyots/data-source';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type IHealthChecksQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type IHealthChecksQuery = { healthChecks: Array<{ name: string, status: string, details?: string | null, responseTime: number }> };

export const HealthChecksDocument = gql`
    query HealthChecks {
  healthChecks {
    name
    status
    details
    responseTime
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class IHealthChecksGQL extends Apollo.Query<IHealthChecksQuery, IHealthChecksQueryVariables> {
    override document = HealthChecksDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }