import { Component, inject, signal } from '@angular/core';
import { Field, FieldTree, form, submit } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import {
  HlmSelect,
  HlmSelectContent,
  HlmSelectOption, HlmSelectScrollDown,
  HlmSelectScrollUp,
  HlmSelectTrigger,
  HlmSelectValue
} from '@nyots/ui/select';
import {
  BrnSelectImports, BrnSelectValueTemplate
} from '@spartan-ng/brain/select';
import { HlmButton } from '@nyots/ui/button';
import { ProjectService } from '@nyots/data-source/projects';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ContributionService } from '@nyots/data-source/contributions';
import { ICreateContributionInput, IProject, IRegisterInput } from '@nyots/data-source';
import { GraphQLError } from 'graphql/error';
import { mapGraphqlValidationErrors } from '@nyots/data-source/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

interface ContributionData {
  project: {
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
  } | null;
  amount: string;
  description: string;
}

@Component({
  imports: [
    CommonModule,
    HlmInput,
    HlmLabel,
    HlmSelect,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmSelectContent,
    HlmSelectOption,
    Field,
    HlmSelectScrollUp,
    HlmSelectScrollDown,
    BrnSelectImports,
    HlmButton,
    BrnSelectValueTemplate,
  ],
  templateUrl: './contribution-form.html',
})
export class ContributionForm {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly contributionService = inject(ContributionService);
  projects$ = this.projectService.getAllProjects({}).pipe(
    map((result) => {
      if (result?.edges) {
        return result.edges.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          description: edge.node.description,
          startDate: edge.node.startDate,
          endDate: edge.node.endDate,
        }));
      }
      return [];
    }),
  );
  projects = toSignal(this.projects$, { initialValue: [] });
  isLoading = signal(false);

  // 1. Create the Form Model (single source of truth)
  contributionModel = signal<ContributionData>({
    project: null,
    amount: '',
    description: '',
  });

  // 2. Create the form's field tree from the model
  contributionForm = form(this.contributionModel);

  async createNewContribution(createContributionForm: FieldTree<ContributionData>) {
    try {
      console.log('createNewContribution', createContributionForm.project().value() );
      const newContribution = await this.contributionService.createContribution({
        notes: createContributionForm.description().value(),
        projectId: createContributionForm.project().value()?.id as string,
        amount: Number(createContributionForm.amount().value()),
      });
      await this.router.navigate(['/dashboard','contributions', newContribution?.data.id]);
    } catch (e) {
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      if (graphqlError?.length > 0) {
        return mapGraphqlValidationErrors(graphqlError, createContributionForm);
      }
      return [
        {
          kind: 'server',
          message:
            (e as HttpErrorResponse)?.error?.message ??
            (e as Error).message ??
            'An unknown error occurred.',
          fieldTree: createContributionForm,
        },
      ];
    }

    return null;
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.isLoading.set(true);
    await submit(this.contributionForm, async (fieldTree) =>
      this.createNewContribution(fieldTree as FieldTree<ContributionData>),
    );
    this.isLoading.set(false);
  }

  // 4. Example: Programmatically update a field
  resetDescription() {
    // Update via field state (auto-syncs with model)
    this.contributionForm.description().value.set('');
  }

  // 5. Example: Read individual field value reactively
  getDescriptionLength() {
    return this.contributionForm.description().value().length;
  }
}
