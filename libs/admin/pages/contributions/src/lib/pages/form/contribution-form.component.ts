import {
  Component,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideSave, lucideX } from '@ng-icons/lucide';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { toast } from 'ngx-sonner';
import { UserAutocompleteComponent } from '../../components/user-autocomplete/user-autocomplete.component';
import { ContributionService } from '@nyots/data-source/contributions';
import { IGetAllProjectsQuery, ProjectService } from '@nyots/data-source/projects';
import { IPaymentStatus } from '@nyots/data-source';

@Component({
  selector: 'nyots-contribution-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardHeader,
    HlmCardTitle,
    HlmIcon,
    NgIcon,
    BrnSelectImports,
    UserAutocompleteComponent,
  ],
  providers: [
    provideIcons({
      lucideLoader2,
      lucideSave,
      lucideX,
    }),
  ],
  template: `
    <div class="container mx-auto py-6 max-w-2xl">
      <div hlmCard>
        <div hlmCardHeader>
          <h3 hlmCardTitle>Record Contribution</h3>
          <p hlmCardDescription>
            Manually record a contribution for offline or external payments
          </p>
        </div>
        <div hlmCardContent>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- User Selection -->
            <div class="space-y-2">
              <label hlmLabel for="userId">
                User <span class="text-destructive">*</span>
              </label>
              <nyots-user-autocomplete
                formControlName="userId"
                placeholder="Search for user by name or email..."
              />
              @if (form.get('userId')?.hasError('required') && form.get('userId')?.touched) {
                <p class="text-sm text-destructive">User is required</p>
              }
            </div>

            <!-- Project Selection -->
            <div class="space-y-2">
              <label hlmLabel for="projectId">
                Project <span class="text-destructive">*</span>
              </label>
              <select
                hlmInput
                id="projectId"
                formControlName="projectId"
                class="w-full"
                [attr.aria-label]="'Select project'"
              >
                <option value="">Select a project</option>
                @for (project of projects(); track project.id) {
                  <option [value]="project.id">{{ project.title }}</option>
                }
              </select>
              @if (form.get('projectId')?.hasError('required') && form.get('projectId')?.touched) {
                <p class="text-sm text-destructive">Project is required</p>
              }
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label hlmLabel for="amount">
                Amount <span class="text-destructive">*</span>
              </label>
              <input
                hlmInput
                type="number"
                id="amount"
                formControlName="amount"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                [attr.aria-label]="'Contribution amount'"
              />
              @if (form.get('amount')?.hasError('required') && form.get('amount')?.touched) {
                <p class="text-sm text-destructive">Amount is required</p>
              }
              @if (form.get('amount')?.hasError('min') && form.get('amount')?.touched) {
                <p class="text-sm text-destructive">Amount must be greater than 0</p>
              }
            </div>

            <!-- Payment Status -->
            <div class="space-y-2">
              <label hlmLabel for="paymentStatus">
                Payment Status <span class="text-destructive">*</span>
              </label>
              <select
                hlmInput
                id="paymentStatus"
                formControlName="paymentStatus"
                class="w-full"
                [attr.aria-label]="'Payment status'"
              >
                <option [value]="PaymentStatus.Pending">Pending</option>
                <option [value]="PaymentStatus.Paid">Paid</option>
                <option [value]="PaymentStatus.Failed">Failed</option>
              </select>
            </div>

            <!-- Payment Reference (Optional) -->
            <div class="space-y-2">
              <label hlmLabel for="paymentReference">
                Payment Reference <span class="text-muted-foreground">(Optional)</span>
              </label>
              <input
                hlmInput
                type="text"
                id="paymentReference"
                formControlName="paymentReference"
                placeholder="e.g., Check #1234, Bank Transfer Ref"
                [attr.aria-label]="'Payment reference'"
              />
              <p class="text-sm text-muted-foreground">
                Enter a reference number for offline payments (check number, bank transfer reference, etc.)
              </p>
            </div>

            <!-- Notes (Optional) -->
            <div class="space-y-2">
              <label hlmLabel for="notes">
                Notes <span class="text-muted-foreground">(Optional)</span>
              </label>
              <textarea
                hlmInput
                id="notes"
                formControlName="notes"
                rows="3"
                placeholder="Additional notes about this contribution..."
                class="resize-none"
                [attr.aria-label]="'Contribution notes'"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                hlmBtn
                type="button"
                variant="outline"
                (click)="onCancel()"
                [disabled]="submitting()"
              >
                <ng-icon name="lucideX" hlm size="sm" class="mr-2" />
                Cancel
              </button>
              <button
                hlmBtn
                type="submit"
                [disabled]="form.invalid || submitting()"
              >
                @if (submitting()) {
                  <ng-icon name="lucideLoader2" hlm size="sm" class="mr-2 animate-spin" />
                  Creating...
                } @else {
                  <ng-icon name="lucideSave" hlm size="sm" class="mr-2" />
                  Create Contribution
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class ContributionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contributionService = inject(ContributionService);
  private projectService = inject(ProjectService);
  private router = inject(Router);

  // Form state
  form: FormGroup;
  submitting = signal(false);
  projects = signal<IGetAllProjectsQuery['getAllProjects']['edges'][number]['node'][]>([]);
  loadingProjects = signal(false);

  // Expose PaymentStatus enum to template
  PaymentStatus = IPaymentStatus;

  constructor() {
    // Initialize form with validation
    this.form = this.fb.group({
      userId: ['', Validators.required],
      projectId: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentStatus: [IPaymentStatus.Pending, Validators.required],
      paymentReference: [''],
      notes: [''],
    });
  }

  async ngOnInit() {
    await this.loadProjects();
  }

  /**
   * Load active projects for the dropdown
   */
  async loadProjects() {
    this.loadingProjects.set(true);
    try {
      const result = await this.projectService.getActiveProjects();
      if (result?.edges) {
        this.projects.set(result.edges.map((edge) => edge.node));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects', {
        description: 'Please refresh the page and try again.',
      });
    } finally {
      this.loadingProjects.set(false);
    }
  }

  /**
   * Handle form submission
   */
  async onSubmit() {
    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    try {
      const formValue = this.form.value;

      // Create contribution using admin endpoint
      await this.contributionService.adminCreateContribution({
        userId: formValue.userId,
        projectId: formValue.projectId,
        amount: parseFloat(formValue.amount),
        paymentStatus: formValue.paymentStatus,
        paymentReference: formValue.paymentReference || undefined,
        notes: formValue.notes || undefined,
      });

      toast.success('Contribution created successfully', {
        description: 'The contribution has been recorded in the system.',
      });

      // Navigate back to contributions list
      await this.router.navigate(['/dashboard/contributions']);
    } catch (error: unknown) {
      console.error('Error creating contribution:', error);

      // Extract error message from GraphQL error
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'An unexpected error occurred';

      toast.error('Failed to create contribution', {
        description: errorMessage,
      });
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * Handle cancel button click
   */
  onCancel() {
    this.router.navigate(['/dashboard/contributions']);
  }
}
