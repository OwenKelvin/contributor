import { Routes } from '@angular/router';
import { ProjectsLayoutComponent } from './layout/projects-layout.component';
import { TestEditorComponent } from './pages/test-editor.component';
import { AllProjectsComponent } from './pages/all-projects/all-projects.component';
import { ActiveProjectsComponent } from './pages/active-projects/active-projects.component';
import { PendingProjectsComponent } from './pages/pending-projects/pending-projects.component';
import { ArchivedProjectsComponent } from './pages/archived-projects/archived-projects.component';
import { EditProjectComponent } from './pages/edit-project/edit-project.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';
import { ProjectCategoriesComponent } from './pages/project-categories/project-categories.component';
import { authGuard } from '@nyots/data-source/auth';

export const projectsRoutes: Routes = [
  {
    path: '',
    component: ProjectsLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Temporary test route for RichTextEditor component
      {
        path: 'test-editor',
        component: TestEditorComponent,
        data: {
          breadcrumb: 'Test Editor'
        }
      },
      // All projects route (default)
      {
        path: '',
        component: AllProjectsComponent,
        data: {
          breadcrumb: 'All'
        }
      },
      // Create project route
      {
        path: 'create',
        component: CreateProjectComponent,
        data: {
          breadcrumb: 'Create'
        }
      },
      // Active projects route
      {
        path: 'active',
        component: ActiveProjectsComponent,
        data: {
          breadcrumb: 'Active'
        }
      },
      // Pending projects route
      {
        path: 'pending',
        component: PendingProjectsComponent,
        data: {
          breadcrumb: 'Pending'
        }
      },
      // Archived projects route
      {
        path: 'archived',
        component: ArchivedProjectsComponent,
        data: {
          breadcrumb: 'Archived'
        }
      },
      // Categories management route
      {
        path: 'categories',
        component: ProjectCategoriesComponent,
        data: {
          breadcrumb: 'Categories'
        }
      },
      // Edit project route (must be last to avoid conflicts)
      {
        path: ':id/edit',
        component: EditProjectComponent,
        data: {
          breadcrumb: 'Edit'
        }
      },
    ],
  },
];
