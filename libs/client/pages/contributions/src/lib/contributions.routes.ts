import { Routes } from '@angular/router';

export const ContributionsRoutes: Routes = [
  {
    path: 'create',
    data: { breadcrumb: 'Create' },
    loadComponent: () => import('./contribution-form/contribution-form').then(m => m.ContributionForm),
  },
  {
    path: 'my-contributions',
    data: { breadcrumb: 'My Contributions' },
    loadComponent: () => import('./my-contributions.component').then(m => m.MyContributionsComponent),
  },
  {
    path: ':id',
    data: { breadcrumb: 'Details' },
    loadComponent: () => import('./contribution-detail.component').then(m => m.ContributionDetailComponent),
  },
]
