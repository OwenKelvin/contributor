import {
  Component,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProject } from '@nyots/data-source';
import { HlmTableImports } from '@nyots/ui/table';
import { HlmSkeletonImports } from '@nyots/ui/skeleton';
import { HlmCheckboxImports } from '@nyots/ui/checkbox';
import { HlmButton } from '@nyots/ui/button';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEdit,
  lucideTrash2,
  lucideEye,
  lucideInbox,
} from '@ng-icons/lucide';

@Component({
  selector: 'nyots-project-table',
  standalone: true,
  imports: [
    CommonModule,
    HlmTableImports,
    HlmSkeletonImports,
    HlmCheckboxImports,
    HlmButton,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideEdit,
      lucideTrash2,
      lucideEye,
      lucideInbox,
    }),
  ],
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.scss'],
})
export class ProjectTableComponent {
  // Inputs using new signal-based API
  projects = input<IProject[]>([]);
  isLoading = input<boolean>(false);
  showBulkActions = input<boolean>(false);
  selectedProjects = input<Set<string>>(new Set());

  // Outputs using new signal-based API
  projectEdit = output<string>();
  projectDelete = output<string>();
  projectView = output<string>();
  selectionChange = output<Set<string>>();

  // Internal state for managing selections
  private internalSelection = signal<Set<string>>(new Set());

  // Computed property to check if all projects are selected
  allSelected = computed(() => {
    const projects = this.projects();
    const selected = this.selectedProjects();
    return projects.length > 0 && projects.every(p => selected.has(p.id));
  });

  // Computed property to check if some (but not all) projects are selected
  someSelected = computed(() => {
    const projects = this.projects();
    const selected = this.selectedProjects();
    const hasSelected = projects.some(p => selected.has(p.id));
    const allAreSelected = this.allSelected();
    return hasSelected && !allAreSelected;
  });

  // Loading skeleton rows
  skeletonRows = Array(5).fill(0);

  onEdit(projectId: string) {
    this.projectEdit.emit(projectId);
  }

  onDelete(projectId: string) {
    this.projectDelete.emit(projectId);
  }

  onView(projectId: string) {
    this.projectView.emit(projectId);
  }

  toggleProjectSelection(projectId: string) {
    const currentSelection = new Set(this.selectedProjects());
    
    if (currentSelection.has(projectId)) {
      currentSelection.delete(projectId);
    } else {
      currentSelection.add(projectId);
    }
    
    this.selectionChange.emit(currentSelection);
  }

  toggleAllSelection() {
    const projects = this.projects();
    const currentSelection = new Set(this.selectedProjects());
    
    if (this.allSelected()) {
      // Deselect all
      projects.forEach(p => currentSelection.delete(p.id));
    } else {
      // Select all
      projects.forEach(p => currentSelection.add(p.id));
    }
    
    this.selectionChange.emit(currentSelection);
  }

  isProjectSelected(projectId: string): boolean {
    return this.selectedProjects().has(projectId);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      DRAFT: 'Draft',
      ACTIVE: 'Active',
      PENDING: 'Pending',
      COMPLETED: 'Completed',
      ARCHIVED: 'Archived',
    };
    return statusLabels[status] || status;
  }
}
