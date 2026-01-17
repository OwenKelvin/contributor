import { Routes } from '@angular/router';
import { UsersLayoutComponent } from './layout/users-layout.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { authGuard } from '@nyots/data-source/auth';

export const usersRoutes: Routes = [
  {
    path: '',
    component: UsersLayoutComponent,
    canActivate: [authGuard],
    children: [
      // All users route (default)
      {
        path: '',
        component: AllUsersComponent,
      },
      // TODO: Add more routes as needed
      // {
      //   path: 'permissions',
      //   component: UserPermissionsComponent,
      // },
      // {
      //   path: 'activity',
      //   component: UserActivityComponent,
      // },
      // {
      //   path: 'banned',
      //   component: BannedUsersComponent,
      // },
      // {
      //   path: 'invite',
      //   component: InviteUserComponent,
      // },
      // {
      //   path: ':id/view',
      //   component: ViewUserComponent,
      // },
      // {
      //   path: ':id/edit',
      //   component: EditUserComponent,
      // },
    ],
  },
];
