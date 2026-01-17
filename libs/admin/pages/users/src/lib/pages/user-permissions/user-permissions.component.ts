import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { IUser, IRole } from '@nyots/data-source';
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
  lucideSearch,
  lucideUserCheck,
  lucideShield,
  lucideUsers,
  lucideCheck,
  lucideX,
} from '@ng-icons/lucide';

@Component({
  selector: 'nyots-user-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
      lucideSearch,
      lucideUserCheck,
      lucideShield,
      lucideUsers,
      lucideCheck,
      lucideX,
    }),
  ],
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss'],
})
export class UserPermissionsComponent {
  // State management
  users = signal<IUser[]>([]);
  roles = signal<IRole[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedUserId = signal<string | null>(null);

  // Computed
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.users();
    return this.users().filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    try {
      // TODO: Replace with actual API calls
      const mockRoles: IRole[] = [
        { id: '1', name: 'Admin', description: 'Full system access' },
        { id: '2', name: 'User', description: 'Regular user access' },
        { id: '3', name: 'Moderator', description: 'Content moderation access' },
      ];

      const mockUsers: IUser[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          roles: [mockRoles[0]],
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+1234567891',
          roles: [mockRoles[1]],
        },
      ];

      this.roles.set(mockRoles);
      this.users.set(mockUsers);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load permissions data');
    } finally {
      this.isLoading.set(false);
    }
  }

  getUserName(user: IUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }

  hasRole(user: IUser, roleId: string): boolean {
    return user.roles?.some((r) => r.id === roleId) || false;
  }

  async toggleRole(user: IUser, role: IRole) {
    try {
      const hasRole = this.hasRole(user, role.id);
      // TODO: Implement API call to update user roles
      console.log(`${hasRole ? 'Removing' : 'Adding'} role ${role.name} for user ${user.email}`);
      toast.success(`Role ${hasRole ? 'removed' : 'added'} successfully`);
      await this.loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }
}
