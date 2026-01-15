import { Routes } from '@angular/router';
import { TestEditorComponent } from './pages/test-editor.component';

export const projectsRoutes: Routes = [
  // Temporary test route for RichTextEditor component
  {
    path: 'test-editor',
    component: TestEditorComponent,
  },
  // Routes will be defined in task 15
];
