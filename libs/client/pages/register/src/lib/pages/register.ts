// signup.component.ts
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { form, Field, required, email, submit, minLength, validate } from '@angular/forms/signals';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmLabel } from '@nyots/ui/label';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardFooter, HlmCardHeader, HlmCardTitle } from '@nyots/ui/card';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideMail, lucideLock, lucideUser, lucidePhone } from '@ng-icons/lucide';

interface SignupResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

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
    NgIcon
  ],
  providers: [provideIcons({ lucideLoader2, lucideMail, lucideLock, lucideUser, lucidePhone })],
  templateUrl: './register.html',
})
export class Register {
  private http = inject(HttpClient);

  // Form model
  private signupModel = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Create form with validation schema
  protected signupForm = form(this.signupModel, (form) => {
    required(form.firstName, { message: 'First name is required' });
    required(form.lastName, { message: 'Last name is required' });
    required(form.email, { message: 'Email is required' });
    email(form.email, { message: 'Please enter a valid email' });
    required(form.phone, { message: 'Phone number is required' });
    required(form.password, { message: 'Password is required' });
    minLength(form.password, 8, { message: 'Password must be at least 8 characters' });
    required(form.confirmPassword, { message: 'Please confirm your password' });
    validate(form.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(form.password)) {
        return {
          kind: 'match',
          message: 'Password and confirm password do not match'
        }
      }
      return null
    })
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  async onSubmit(signupForm: typeof this.signupForm) {
    const results = await submit(signupForm, async (state) => {
      if (!state().valid()) {
        return;
      }

      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const { confirmPassword, ...credentials } = state().value();

      try {
        const response = await this.http
          .post<SignupResponse>('api/auth/signup', credentials)
          .toPromise();

        this.isLoading.set(false);

        if (response && response.success) {
          // Store tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          // Store user info
          localStorage.setItem('user', JSON.stringify(response.data.user));

          this.successMessage.set('Account created successfully!');
          console.log('Signup successful:', response.data.user);

          // Navigate to dashboard or home page after a brief delay
          // setTimeout(() => {
          //   this.router.navigate(['/dashboard']);
          // }, 1500);
        }
      } catch (error: any) {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Signup failed. Please try again.'
        );
        console.error('Signup error:', error);
      }
    });
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
