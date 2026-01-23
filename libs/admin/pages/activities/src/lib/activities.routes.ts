import { Activities } from './activities/activities';
import { Routes } from '@angular/router';

export const activitiesRoutes: Routes = [
  {
    path: 'recent',
    component: Activities,
    data: { breadcrumb: 'Recent' },
  },
];
