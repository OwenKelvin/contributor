import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@nyots/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@nyots/ui/icon';
import {
  lucidePlus,
  lucideList,
  lucideCheckCircle,
  lucideClock,
  lucideArchive,
  lucideFolderOpen,
} from '@ng-icons/lucide';

@Component({
  selector: 'nyots-projects-layout',
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
      lucideList,
      lucideCheckCircle,
      lucideClock,
      lucideArchive,
      lucideFolderOpen,
    }),
  ],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-slate-900">Projects Management</h1>
            <a
              hlmBtn
              routerLink="/projects/create"
              class="inline-flex items-center gap-2"
            >
              <ng-icon hlmIcon name="lucidePlus" size="sm" />
              Create Project
            </a>
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="bg-white border-b border-slate-200">
        <div class="container mx-auto px-4">
          <div class="flex gap-1 overflow-x-auto">
            <a
              routerLink="/projects"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideList" size="sm" />
              All Projects
            </a>
            <a
              routerLink="/projects/active"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideCheckCircle" size="sm" />
              Active
            </a>
            <a
              routerLink="/projects/pending"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideClock" size="sm" />
              Pending
            </a>
            <a
              routerLink="/projects/archived"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideArchive" size="sm" />
              Archived
            </a>
            <a
              routerLink="/projects/categories"
              routerLinkActive="border-b-2 border-blue-600 text-blue-600"
              class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <ng-icon name="lucideFolderOpen" size="sm" />
              Categories
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
export class ProjectsLayoutComponent {}
