import { Component, inject, signal, OnInit, ElementRef } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
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
import { GOOGLE_CLIENT_ID } from '@nyots/data-source/constants';

declare const google: any;

@Component({
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
export class Register implements OnInit {
  private readonly googleClientId = inject(GOOGLE_CLIENT_ID)
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private elementRef = inject(ElementRef);

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
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    console.log(this.googleClientId)
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: this.handleGoogleAuthResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      google.accounts.id.renderButton(
        this.elementRef.nativeElement.querySelector('#google-btn-container-register'),
        { theme: 'outline', size: 'large', width: '100%' } // customization attributes
      );
    }
  }

  async registerNewUser(registrationForm: FieldTree<IRegisterInput>) {
    try {
      await this.authService.register(registrationForm().value());
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      const graphqlError = (e as { errors: GraphQLError[] }).errors;
      if (graphqlError?.length > 0) {
        return mapGraphqlValidationErrors(graphqlError, registrationForm);
      }
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

  onGoogleSignup() {
    // This is now handled by the Google Identity Services button
  }

  private async handleGoogleAuthResponse(response: any) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    if (response.credential) {
      try {
        const backendResponse = await this.authService.googleLogin(response.credential);
        if (backendResponse.data?.googleLogin.accessToken) {
          await this.router.navigate(['/dashboard']);
        }
      } catch (error: any) {
        console.error('Backend Google login error:', error);
        this.errorMessage.set(
          error.errors?.[0]?.message || 'Google login failed on backend.',
        );
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.errorMessage.set('Google authentication failed: No credential received.');
      this.isLoading.set(false);
    }
  }
}
