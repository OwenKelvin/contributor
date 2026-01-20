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
import { Router, RouterLink } from '@angular/router';
import { GraphQLError } from 'graphql/error';
import { IRegisterInput } from '@nyots/data-source';
import { mapGraphqlValidationErrors } from '@nyots/data-source/helpers';
import { HttpErrorResponse } from '@angular/common/http';

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
    RouterLink,
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
  successMessage = signal<string | null>(null);

  async registerNewUser(registrationForm: FieldTree<IRegisterInput>) {
    try {
      await this.authService.register(registrationForm().value());
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      if (graphqlError?.length > 0) {
        return mapGraphqlValidationErrors(graphqlError, registrationForm);
      }
      console.log({ e });
      return [
        {
          kind: 'server',
          message:
            (e as HttpErrorResponse)?.error?.message ??
            (e as Error).message ??
            'An unknown error occurred.',
          fieldTree: registrationForm,
        },
      ];
    }

    return null;
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.isLoading.set(true);
    await submit(this.signupForm, async (fieldTree) =>
      this.registerNewUser(fieldTree),
    );
    this.isLoading.set(false);
  }

  async onGoogleSignup() {
    this.isLoading.set(true);
    this.successMessage.set(null);

    try {
      const googleOAuthUrl = await this.authService.getGoogleOAuthUrl();
      window.location.href = googleOAuthUrl;
    } catch (error: any) {
      console.error('Google signup initiation error:', error);
      this.isLoading.set(false);
      // Assuming you want to display the error, use a dedicated error signal if successMessage is only for success
      // For now, I'll set successMessage to null and rely on console.error
      // If there's an errorMessage signal, that would be better here.
      // For demonstration, let's assume we can set an error message on the form directly or use a shared toast service.
    }
  }
}
