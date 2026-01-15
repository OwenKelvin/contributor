import { Routes } from '@angular/router';
import { TestEditorComponent } from './pages/test-editor.component';
import { AllProjectsComponent } from './pages/all-projects/all-projects.component';
import { ActiveProjectsComponent } from './pages/active-projects/active-projects.component';
import { PendingProjectsComponent } from './pages/pending-projects/pending-projects.component';
import { ArchivedProjectsComponent } from './pages/archived-projects/archived-projects.component';
import { EditProjectComponent } from './pages/edit-project/edit-project.component';
import { ProjectCategoriesComponent } from './pages/project-categories/project-categories.component';

export const projectsRoutes: Routes = [
  // Temporary test route for RichTextEditor component
  {
    path: 'test-editor',
    component: TestEditorComponent,
  },
  // All projects route
  {
    path: '',
    component: AllProjectsComponent,
  },
  // Active projects route
  {
    path: 'active',
    component: ActiveProjectsComponent,
  },
  // Pending projects route
  {
    path: 'pending',
    component: PendingProjectsComponent,
  },
  // Archived projects route
  {
    path: 'archived',
    component: ArchivedProjectsComponent,
  },
  // Edit project route
  {
    path: ':id/edit',
    component: EditProjectComponent,
  },
  // Categories management route
  {
    path: 'categories',
    component: ProjectCategoriesComponent,
  },
  // Additional routes will be defined in task 15
];
