import { Component, inject, signal, input } from '@angular/core';
import { Field, FieldTree, form, submit } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { HlmButton } from '@nyots/ui/button';
import { ContributionService } from '@nyots/data-source/contributions';
import { GraphQLError } from 'graphql/error';
import { mapGraphqlValidationErrors } from '@nyots/data-source/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { Router } from '@angular/router';

interface ContributionData {
  amount: string;
  description: string;
}

@Component({
  selector: 'nyots-contribution-dialog',
  imports: [
    CommonModule,
    HlmInput,
    HlmLabel,
    Field,
    HlmButton,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Contribute to Project</h2>
        <p class="text-muted-foreground mt-1">
          {{ projectTitle() }}
        </p>
      </div>

      <form (submit)="onSubmit($event)" class="space-y-6">
        <!-- Amount Field -->
        <div class="space-y-2">
          <label hlmLabel for="amount">Amount *</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              hlmInput
              id="amount"
              type="number"
              step="0.01"
              [field]="contributionForm.amount"
              placeholder="0.00"
              class="pl-8 w-full"
            />
          </div>
        </div>

        <!-- Description Field -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <label hlmLabel for="description">Notes (Optional)</label>
            <span class="text-sm text-gray-500">
              {{ getDescriptionLength() }}/500
            </span>
          </div>
          <textarea
            hlmInput
            id="description"
            [field]="contributionForm.description"
            placeholder="Add any notes about this contribution"
            rows="3"
            class="w-full resize-none"
          ></textarea>
        </div>

        @if (errorMessage()) {
          <div class="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {{ errorMessage() }}
          </div>
        }

        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            hlmBtn
            variant="outline"
            (click)="closeDialog()"
            [disabled]="isLoading()"
          >
            Cancel
          </button>
          <button
            type="submit"
            hlmBtn
            variant="default"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span>Processing...</span>
            } @else {
              <span>Contribute</span>
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ContributionDialogComponent {
  private readonly contributionService = inject(ContributionService);
  private readonly dialogRef = inject(BrnDialogRef);
  private readonly router = inject(Router);
  
  projectId = input.required<string>();
  projectTitle = input.required<string>();
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Form Model
  contributionModel = signal<ContributionData>({
    amount: '',
    description: '',
  });

  // Form field tree
  contributionForm = form(this.contributionModel);

  async createNewContribution(createContributionForm: FieldTree<ContributionData>) {
    this.errorMessage.set(null);
    
    try {
      const amount = Number(createContributionForm.amount().value());
      
      if (isNaN(amount) || amount <= 0) {
        this.errorMessage.set('Please enter a valid amount greater than 0');
        return null;
      }

      const result = await this.contributionService.createContribution({
        notes: createContributionForm.description().value() || undefined,
        projectId: this.projectId(),
        amount: amount,
      });

      // Close dialog and navigate to contribution detail
      this.dialogRef.close(true);
      
      if (result?.data?.id) {
        await this.router.navigate(['/dashboard', 'contributions', result.data.id]);
      }
      
      return null;
    } catch (e) {
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      if (graphqlError?.length > 0) {
        const errors = mapGraphqlValidationErrors(graphqlError, createContributionForm);
        if (Array.isArray(errors) && errors.length > 0) {
          this.errorMessage.set(errors[0].message);
        }
        return errors;
      }
      
      const errorMsg = (e as HttpErrorResponse)?.error?.message ??
        (e as Error).message ??
        'An unknown error occurred.';
      
      this.errorMessage.set(errorMsg);
      
      return null;
    }
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.isLoading.set(true);
    await submit(this.contributionForm, async (fieldTree) =>
      this.createNewContribution(fieldTree as FieldTree<ContributionData>),
    );
    this.isLoading.set(false);
  }

  getDescriptionLength() {
    return this.contributionForm.description().value().length;
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
