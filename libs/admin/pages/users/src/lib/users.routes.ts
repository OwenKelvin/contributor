import { Routes } from '@angular/router';
import { UsersLayoutComponent } from './layout/users-layout.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { UserPermissionsComponent } from './pages/user-permissions/user-permissions.component';
import { UserActivityComponent } from './pages/user-activity/user-activity.component';
import { BannedUsersComponent } from './pages/banned-users/banned-users.component';
import { InviteUserComponent } from './pages/invite-user/invite-user.component';
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
      // User permissions route
      {
        path: 'permissions',
        component: UserPermissionsComponent,
      },
      // User activity route
      {
        path: 'activity',
        component: UserActivityComponent,
      },
      // Banned users route
      {
        path: 'banned',
        component: BannedUsersComponent,
      },
      // Invite user route
      {
        path: 'invite',
        component: InviteUserComponent,
      },
      // TODO: Add more routes as needed
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
