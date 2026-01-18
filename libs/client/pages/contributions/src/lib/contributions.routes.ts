import { Routes } from '@angular/router';

export const ContributionsRoutes: Routes = [
  {
    path: 'create',
    loadComponent: () => import('./contribution-form/contribution-form').then(m => m.ContributionForm),
  }
]
