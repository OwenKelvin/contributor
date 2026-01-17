import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { IRole } from '@nyots/data-source';
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
import {
  lucideMail,
  lucideUser,
  lucidePhone,
  lucideShield,
  lucideSend,
  lucideUserPlus,
} from '@ng-icons/lucide';

@Component({
  selector: 'nyots-invite-user',
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
  ],
  providers: [
    provideIcons({
      lucideMail,
      lucideUser,
      lucidePhone,
      lucideShield,
      lucideSend,
      lucideUserPlus,
    }),
  ],
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.scss'],
})
export class InviteUserComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // State
  roles = signal<IRole[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

  // Form
  inviteForm: FormGroup;

  constructor() {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phoneNumber: [''],
      roleIds: [[], [Validators.required]],
      sendEmail: [true],
      customMessage: [''],
    });

    this.loadRoles();
  }

  async loadRoles() {
    this.isLoading.set(true);
    try {
      // TODO: Replace with actual API call
      const mockRoles: IRole[] = [
        { id: '1', name: 'Admin', description: 'Full system access' },
        { id: '2', name: 'User', description: 'Regular user access' },
        { id: '3', name: 'Moderator', description: 'Content moderation access' },
      ];

      this.roles.set(mockRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      this.isLoading.set(false);
    }
  }

  isRoleSelected(roleId: string): boolean {
    const selectedRoles = this.inviteForm.get('roleIds')?.value || [];
    return selectedRoles.includes(roleId);
  }

  toggleRole(roleId: string) {
    const roleIds = this.inviteForm.get('roleIds');
    const currentRoles = roleIds?.value || [];
    
    if (currentRoles.includes(roleId)) {
      roleIds?.setValue(currentRoles.filter((id: string) => id !== roleId));
    } else {
      roleIds?.setValue([...currentRoles, roleId]);
    }
  }

  async onSubmit() {
    if (this.inviteForm.invalid) {
      Object.keys(this.inviteForm.controls).forEach(key => {
        const control = this.inviteForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      toast.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const formValue = this.inviteForm.value;
      // TODO: Implement API call to invite user
      console.log('Inviting user:', formValue);
      
      toast.success('User invitation sent successfully');
      this.router.navigate(['/dashboard/users']);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to send invitation');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard/users']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.inviteForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return 'This field is required';
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
    }
    return null;
  }
}
