import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@nyots/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@nyots/ui/icon';
import {
  lucidePlus,
  lucideUsers,
  lucideUserCheck,
  lucideHistory,
  lucideShield,
} from '@ng-icons/lucide';

@Component({
  selector: 'nyots-users-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HlmButton,
    NgIcon,
    HlmIcon,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideUsers,
      lucideUserCheck,
      lucideHistory,
      lucideShield,
    }),
  ],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-slate-900">User Management</h1>
            <a
              hlmBtn
              [routerLink]="['/dashboard','users','invite']"
              class="inline-flex items-center gap-2"
            >
              <ng-icon hlmIcon name="lucidePlus" size="sm" />
              Invite User
            </a>
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="bg-white border-b border-slate-200">
        <div class="container mx-auto px-4">
          <div class="flex gap-1 overflow-x-auto">
            <a
              routerLink="/dashboard/users"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideUsers" size="sm" />
              All Users
            </a>
            <a
              routerLink="/dashboard/users/permissions"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideUserCheck" size="sm" />
              Permissions
            </a>
            <a
              routerLink="/dashboard/users/activity"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideHistory" size="sm" />
              Activity
            </a>
            <a
              routerLink="/dashboard/users/banned"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideShield" size="sm" />
              Banned
            </a>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-6">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class UsersLayoutComponent {}
