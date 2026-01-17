import {
  Component,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  form,
  Field,
  required,
  submit,
  validate,
  FieldTree,
} from '@angular/forms/signals';
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
import { toast } from 'ngx-sonner';
import { UserAutocompleteComponent } from '../../components/user-autocomplete/user-autocomplete.component';
import { ContributionService } from '@nyots/data-source/contributions';
import { IGetAllProjectsQuery, ProjectService } from '@nyots/data-source/projects';
import { IPaymentStatus, IAdminCreateContributionInput } from '@nyots/data-source';
import { mapGraphqlValidationErrors } from '@nyots/data-source/helpers';
import { GraphQLError } from 'graphql/error';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'nyots-contribution-form',
  standalone: true,
  imports: [
    CommonModule,
    Field,
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
          <form (submit)="onSubmit($event)" class="space-y-6">
            <!-- User Selection -->
            <div class="space-y-2">
              <label hlmLabel for="userId">
                User <span class="text-destructive">*</span>
              </label>
              <nyots-user-autocomplete
                [field]="contributionForm.userId"
                placeholder="Search for user by name or email..."
              />
              @if (contributionForm.userId().errors().length > 0) {
                <p class="text-sm text-destructive">{{ contributionForm.userId().errors()[0].message }}</p>
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
                [field]="contributionForm.projectId"
                class="w-full"
                [attr.aria-label]="'Select project'"
              >
                <option value="">Select a project</option>
                @for (project of projects(); track project.id) {
                  <option [value]="project.id">{{ project.title }}</option>
                }
              </select>
              @if (contributionForm.projectId().errors().length > 0) {
                <p class="text-sm text-destructive">{{ contributionForm.projectId().errors()[0].message }}</p>
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
                [field]="contributionForm.amount"
                placeholder="0.00"
                [attr.aria-label]="'Contribution amount'"
              />
              @if (contributionForm.amount().errors().length > 0) {
                <p class="text-sm text-destructive">{{ contributionForm.amount().errors()[0].message }}</p>
              }
              <p class="text-sm text-muted-foreground">
                Enter amount with up to 2 decimal places (e.g., 100.50)
              </p>
            </div>

            <!-- Payment Status -->
            <div class="space-y-2">
              <label hlmLabel for="paymentStatus">
                Payment Status <span class="text-destructive">*</span>
              </label>
              <select
                hlmInput
                id="paymentStatus"
                [field]="contributionForm.paymentStatus"
                class="w-full"
                [attr.aria-label]="'Payment status'"
              >
                <option [value]="PaymentStatus.Pending">Pending</option>
                <option [value]="PaymentStatus.Paid">Paid</option>
                <option [value]="PaymentStatus.Failed">Failed</option>
              </select>
              @if (contributionForm.paymentStatus().errors().length > 0) {
                <p class="text-sm text-destructive">{{ contributionForm.paymentStatus().errors()[0].message }}</p>
              }
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
                [field]="contributionForm.paymentReference"
                placeholder="e.g., Check #1234, Bank Transfer Ref"
                [attr.aria-label]="'Payment reference'"
              />
              @if (contributionForm.paymentReference().errors().length > 0) {
                <p class="text-sm text-destructive">{{ contributionForm.paymentReference().errors()[0].message }}</p>
              }
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
                [field]="contributionForm.notes"
                rows="3"
                placeholder="Additional notes about this contribution..."
                class="resize-none"
                [attr.aria-label]="'Contribution notes'"
              ></textarea>
              @if (contributionForm.notes().errors().length > 0) {
                <p class="text-sm text-destructive">{{ contributionForm.notes().errors()[0].message }}</p>
              }
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
                [disabled]="!contributionForm().valid() || submitting()"
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
  private contributionService = inject(ContributionService);
  private projectService = inject(ProjectService);
  private router = inject(Router);

  // Form state
  submitting = signal(false);
  projects = signal<IGetAllProjectsQuery['getAllProjects']['edges'][number]['node'][]>([]);
  loadingProjects = signal(false);

  // Expose PaymentStatus enum to template
  PaymentStatus = IPaymentStatus;

  // Form model
  private contributionModel = signal({
    userId: '',
    projectId: '',
    amount: 0,
    paymentStatus: IPaymentStatus.Pending,
    paymentReference: '',
    notes: '',
  });

  // Create form with validation schema
  protected contributionForm = form(this.contributionModel, (form) => {
    required(form.userId, { message: 'User is required' });
    required(form.projectId, { message: 'Project is required' });
    required(form.amount, { message: 'Amount is required' });
    validate(form.amount, ({ value }) => {
      const amount = value();
      if (amount === null || amount === undefined || amount <= 0) {
        return {
          kind: 'min',
          message: 'Amount must be greater than 0',
        };
      }
      // Check for max 2 decimal places
      const decimalPlaces = (amount.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        return {
          kind: 'decimal',
          message: 'Amount can have at most 2 decimal places',
        };
      }
      return null;
    });
    required(form.paymentStatus, { message: 'Payment status is required' });
  });

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
   * Create contribution with error handling
   */
  async createContribution(contributionForm: FieldTree<{
    userId: string;
    projectId: string;
    amount: number;
    paymentStatus: IPaymentStatus;
    paymentReference: string;
    notes: string;
  }>) {
    try {
      const formValue = contributionForm().value();

      await this.contributionService.adminCreateContribution({
        userId: formValue.userId,
        projectId: formValue.projectId,
        amount: parseFloat(formValue.amount.toString()),
        paymentStatus: formValue.paymentStatus,
        paymentReference: formValue.paymentReference || undefined,
        notes: formValue.notes || undefined,
      });

      toast.success('Contribution created successfully', {
        description: 'The contribution has been recorded in the system.',
      });

      // Navigate back to contributions list
      await this.router.navigate(['/dashboard/contributions']);
    } catch (e) {
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      console.log(graphqlError);
      if (graphqlError?.length > 0) {
        return mapGraphqlValidationErrors(graphqlError, contributionForm);
      }
      console.error('Error creating contribution:', e);
      return [
        {
          kind: 'server',
          message:
            (e as HttpErrorResponse)?.error?.message ??
            (e as Error).message ??
            'An unknown error occurred.',
          fieldTree: contributionForm,
        },
      ];
    }

    return null;
  }

  /**
   * Handle form submission
   */
  async onSubmit(e: Event) {
    e.preventDefault();
    this.submitting.set(true);
    await submit(this.contributionForm, async (fieldTree) =>
      this.createContribution(fieldTree),
    );
    this.submitting.set(false);
  }

  /**
   * Handle cancel button click
   */
  onCancel() {
    this.router.navigate(['/dashboard/contributions']);
  }
}
