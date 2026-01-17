import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { IUser, IRole } from '@nyots/data-source';
import { UserService } from '@nyots/data-source/user';
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
  private readonly userService = inject(UserService);

  // State management
  users = signal<IUser[]>([]);
  roles = signal<IRole[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

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
      // Load users
      const usersResult = await this.userService.getAllUsers({
        pagination: { first: 100 },
      });
      
      if (usersResult) {
        this.users.set(usersResult.edges.map(e => e.node).filter((u): u is IUser => !!u));
        
        // Extract unique roles from all users
        const rolesMap = new Map<string, IRole>();
        usersResult.edges.forEach(edge => {
          edge.node.roles?.forEach(role => {
            if (role && !rolesMap.has(role.id)) {
              rolesMap.set(role.id, role);
            }
          });
        });
        this.roles.set(Array.from(rolesMap.values()));
      }
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
      const currentRoleIds = user.roles?.map(r => r.id) || [];
      const newRoleIds = hasRole
        ? currentRoleIds.filter(id => id !== role.id)
        : [...currentRoleIds, role.id];

      await this.userService.updateUser(user.id, {
        roleIds: newRoleIds,
      });

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
