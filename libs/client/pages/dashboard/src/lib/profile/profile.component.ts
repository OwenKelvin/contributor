import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  form,
  required,
  email,
  submit,
  minLength,
  validate,
  FieldTree,
  FormField,
} from '@angular/forms/signals';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardFooter,
  HlmCardHeader,
  HlmCardTitle,
} from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLoader2,
  lucideMail,
  lucideLock,
  lucideUser,
  lucidePhone,
  lucideCheck,
} from '@ng-icons/lucide';
import { Router, RouterLink } from '@angular/router';
import { GraphQLError } from 'graphql/error';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '@nyots/data-source/user';
import { IUpdateUserInput, IUser } from '@nyots/data-source';
import { mapGraphqlValidationErrors } from '@nyots/data-source/helpers';
import { toast } from 'ngx-sonner';
import { HlmToaster } from '@nyots/ui/sonner';

@Component({
  selector: 'nyots-profile',
  standalone: true,
  imports: [
    CommonModule,
    HlmButton,
    HlmInput,
    HlmLabel,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardFooter,
    HlmCardHeader,
    HlmCardTitle,
    HlmIcon,
    NgIcon,
    RouterLink,
    FormField,
    HlmToaster,
  ],
  providers: [
    provideIcons({
      lucideLoader2,
      lucideMail,
      lucideLock,
      lucideUser,
      lucidePhone,
      lucideCheck,
    }),
  ],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  currentUser = signal<IUser | null>(null);
  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  private profileModel = signal({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  protected profileForm = form(this.profileModel, (form) => {
    required(form.firstName, { message: 'First name is required' });
    required(form.lastName, { message: 'Last name is required' });
    required(form.email, { message: 'Email is required' });
    email(form.email, { message: 'Please enter a valid email' });
    required(form.phoneNumber, { message: 'Phone number is required' });
    validate(form.password, ({ value }) => {
      const val = value();
      if (val && val.length > 0 && val.length < 8) {
        return {
          kind: 'minLength',
          message: 'Password must be at least 8 characters',
        };
      }
      return null;
    });
    validate(form.confirmPassword, ({ value, valueOf }) => {
      const password = valueOf(form.password);
      const confirmPassword = value();
      if (password && confirmPassword && password !== confirmPassword) {
        return {
          kind: 'match',
          message: 'Passwords do not match',
        };
      }
      return null;
    });
  });

  isIncompleteProfile = computed(() => {
    const user = this.currentUser();
    return !!user && !user.firstName;
  });

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        this.router.navigate(['/login']);
        return;
      }
      const user: IUser = JSON.parse(userStr);
      this.currentUser.set(user);
      this.profileModel.set({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    } catch {
      this.router.navigate(['/login']);
    }
  }

  async updateProfile(registrationForm: FieldTree<IUpdateUserInput>) {
    const state = registrationForm().value();
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return null;
    }

    const input: IUpdateUserInput = {
      firstName: state.firstName,
      lastName: state.lastName,
      phoneNumber: state.phoneNumber,
    };

    if (state.email && state.email !== user.email) {
      input.email = state.email;
    }

    if (state.password) {
      input.password = state.password;
    }

    try {
      const updatedUser = await this.userService.updateUser(user.id, input);
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUser.set(updatedUser as IUser);
        this.successMessage.set('Profile updated successfully.');
        toast.success('Profile updated successfully.');
        this.profileModel.set({
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || '',
          phoneNumber: updatedUser.phoneNumber || '',
          email: updatedUser.email || '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (e) {
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      if (graphqlError?.length > 0) {
        return mapGraphqlValidationErrors(graphqlError, registrationForm);
      }
      this.errorMessage.set(
        (e as HttpErrorResponse)?.error?.message ??
          (e as Error).message ??
          'An unknown error occurred.',
      );
      toast.error(this.errorMessage() || 'Failed to update profile.');
      return [
        {
          kind: 'server',
          message: this.errorMessage() || 'Failed to update profile.',
          fieldTree: registrationForm,
        },
      ];
    }

    return null;
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    await submit(this.profileForm, async (fieldTree) =>
      this.updateProfile(fieldTree as unknown as FieldTree<IUpdateUserInput>),
    );
    this.isLoading.set(false);
  }
}
