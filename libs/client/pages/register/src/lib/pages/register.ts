import { Component, inject, signal } from '@angular/core';
import {
  form,
  Field,
  required,
  email,
  submit,
  minLength,
  validate,
  FieldTree,
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
} from '@ng-icons/lucide';
import { AuthService } from '@nyots/data-source/auth';
import { Router } from '@angular/router';
import { GraphQLError } from 'graphql/error';
import { IRegisterInput } from '@nyots/data-source';
import { mapGraphqlValidationErrors } from '@nyots/data-source/helpers';

@Component({
  standalone: true,
  imports: [
    Field,
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
  ],
  providers: [
    provideIcons({
      lucideLoader2,
      lucideMail,
      lucideLock,
      lucideUser,
      lucidePhone,
    }),
  ],
  templateUrl: './register.html',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Form model
  private signupModel = signal({
    firstName: 'Owen',
    lastName: 'Kelvin',
    email: 'otienoowenkelvin@gmail.com',
    phone: '+254712692310',
    password: 'Password@1',
    confirmPassword: 'Password@1',
  });

  // Create form with validation schema
  protected signupForm = form(this.signupModel, (form) => {
    required(form.firstName, { message: 'First name is required' });
    required(form.lastName, { message: 'Last name is required' });
    required(form.email, { message: 'Email is required' });
    email(form.email, { message: 'Please enter a valid email' });
    required(form.phone, { message: 'Phone number is required' });
    required(form.password, { message: 'Password is required' });
    minLength(form.password, 8, {
      message: 'Password must be at least 8 characters',
    });
    required(form.confirmPassword, { message: 'Please confirm your password' });
    validate(form.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(form.password)) {
        return {
          kind: 'match',
          message: 'Password and confirm password do not match',
        };
      }
      return null;
    });
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  async registerNewUser(registrationForm: FieldTree<IRegisterInput>) {
    try {
      await this.authService.register(registrationForm().value());
    } catch (e) {
      return mapGraphqlValidationErrors(
        (e as { errors: GraphQLError[] }).errors,
        registrationForm,
      );
    }

    return null;
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    await submit(this.signupForm, async (fieldTree) =>
      this.registerNewUser(fieldTree),
    );
  }

  onGoogleSignup() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Implement Google OAuth flow
    console.log('Google signup clicked');

    // Example: Redirect to Google OAuth endpoint
    // window.location.href = 'api/auth/google';

    this.isLoading.set(false);
  }
}
