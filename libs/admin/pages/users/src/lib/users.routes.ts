import { Routes } from '@angular/router';
import { UsersLayoutComponent } from './layout/users-layout.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { UserPermissionsComponent } from './pages/user-permissions/user-permissions.component';
import { UserActivityComponent } from './pages/user-activity/user-activity.component';
import { BannedUsersComponent } from './pages/banned-users/banned-users.component';
import { InviteUserComponent } from './pages/invite-user/invite-user.component';
import { authGuard } from '@nyots/data-source/auth';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';

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
        data: {
          breadcrumb: 'All'
        }
      },
      // User permissions route
      {
        path: 'permissions',
        component: UserPermissionsComponent,
        data: {
          breadcrumb: 'Permissions'
        }
      },
      // User activity route
      {
        path: 'activity',
        component: UserActivityComponent,
        data: {
          breadcrumb: 'Activity'
        }
      },
      // Banned users route
      {
        path: 'banned',
        component: BannedUsersComponent,
        data: {
          breadcrumb: 'Banned'
        }
      },
      // Invite user route
      {
        path: 'invite',
        component: InviteUserComponent,
        data: {
          breadcrumb: 'Invite'
        }
      },
      // New: User Detail Route
      {
        path: ':id/view',
        component: UserDetailComponent,
        data: {
          breadcrumb: 'View'
        }
      },
      // TODO: Add more routes as needed
      // {
      //   path: ':id/edit',
      //   component: EditUserComponent,
      // },
    ],
  },
];
