import { Component, inject } from '@angular/core';
import {
  HlmSidebar,
  HlmSidebarContent, HlmSidebarFooter,
  HlmSidebarGroup,
  HlmSidebarGroupContent,
  HlmSidebarHeader,
  HlmSidebarInset,
  HlmSidebarMenu,
  HlmSidebarMenuButton,
  HlmSidebarMenuItem,
  HlmSidebarMenuSub,
  HlmSidebarMenuSubButton,
  HlmSidebarMenuSubItem,
  HlmSidebarTrigger,
  HlmSidebarWrapper
} from '@nyots/ui/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@nyots/ui/icon';
import {
  lucideBarChart3,
  lucideChevronRight,
  lucideFileText,
  lucideFolderOpen,
  lucideHistory,
  lucidePlus,
  lucideWallet,
  lucideUsers,
  lucideSettings,
  lucideShield,
  lucideUserCheck,
  lucideListChecks,
  lucideDollarSign,
  lucideTrendingUp,
  lucideArchive,
  lucideAlertCircle, lucideChevronUp
} from '@ng-icons/lucide';
import { HlmCollapsible, HlmCollapsibleContent, HlmCollapsibleTrigger } from '@nyots/ui/collapsible';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HlmDropdownMenu, HlmDropdownMenuItem, HlmDropdownMenuTrigger } from '@nyots/ui/dropdown-menu';
import { AuthService } from '@nyots/data-source/auth';
import { HlmDialogService } from '@nyots/ui/dialog';
import { ConfirmationDialogComponent } from '@nyots/ui/dialog';
import { firstValueFrom } from 'rxjs';
import {
  BreadcrumbService,
  HlmBreadcrumb,
  HlmBreadcrumbItem, HlmBreadcrumbLink, HlmBreadcrumbList, HlmBreadcrumbPage,
  HlmBreadcrumbSeparator
} from '@nyots/ui/breadcrumb';

@Component({
  imports: [
    HlmSidebar,
    HlmSidebarContent,
    HlmSidebarGroup,
    HlmSidebarHeader,
    HlmSidebarWrapper,
    HlmSidebarGroupContent,
    HlmSidebarMenu,
    HlmSidebarMenuItem,
    HlmSidebarMenuButton,
    NgIcon,
    HlmIcon,
    HlmSidebarInset,
    HlmSidebarTrigger,
    HlmCollapsible,
    HlmCollapsibleTrigger,
    HlmCollapsibleContent,
    HlmSidebarMenuSubItem,
    HlmSidebarMenuSub,
    HlmSidebarMenuSubButton,
    NgOptimizedImage,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HlmSidebarFooter,
    HlmDropdownMenuTrigger,
    HlmDropdownMenu,
    HlmDropdownMenuItem,
    HlmBreadcrumb,
    HlmBreadcrumbSeparator,
    HlmBreadcrumbItem,
    HlmBreadcrumbLink,
    HlmBreadcrumbPage,
    HlmBreadcrumbList,
  ],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar>
        <div hlmSidebarHeader class="flex items-center gap-2 px-4 py-3">
          <div class="flex items-center w-full">
            <img
              class="w-16"
              ngSrc="/logo.svg"
              width="472"
              height="472"
              alt="Admin Logo"
              priority=""
            />
            <span class="ms-4 text-lg font-semibold">NyotsCo. Admin</span>
          </div>
        </div>
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <div hlmSidebarGroupContent>
              <ul hlmSidebarMenu>
                @for (item of _items; track item.title) {
                  <hlm-collapsible
                    [expanded]="item.defaultOpen"
                    class="group/collapsible"
                  >
                    <li hlmSidebarMenuItem>
                      <button
                        hlmCollapsibleTrigger
                        hlmSidebarMenuButton
                        class="flex w-full items-center justify-between"
                      >
                        <div class="flex items-center gap-2">
                          <ng-icon [name]="item.icon" hlm size="sm" />
                          <span>{{ item.title }}</span>
                        </div>
                        <ng-icon
                          name="lucideChevronRight"
                          class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
                          hlm
                        />
                      </button>
                      <hlm-collapsible-content>
                        <ul hlmSidebarMenuSub>
                          @for (subItem of item.items; track subItem.title) {
                            <li hlmSidebarMenuSubItem>
                              <a
                                [routerLink]="subItem.route"
                                routerLinkActive="bg-accent text-accent-foreground"
                                hlmSidebarMenuSubButton
                                class="flex w-full items-center gap-2"
                              >
                                <ng-icon
                                  [name]="subItem.icon"
                                  hlm
                                  size="sm"
                                  class="text-muted-foreground"
                                />
                                <span>{{ subItem.title }}</span>
                              </a>
                            </li>
                          }
                        </ul>
                      </hlm-collapsible-content>
                    </li>
                  </hlm-collapsible>
                }
              </ul>
            </div>
          </div>
        </div>
        <div hlmSidebarFooter>
          <ul hlmSidebarMenu>
            <li hlmSidebarMenuItem>
              <button hlmSidebarMenuButton [hlmDropdownMenuTrigger]="menu">
                My Account
                <ng-icon hlmIcon name="lucideChevronUp" class="ml-auto" />
              </button>
              <ng-template #menu>
                <hlm-dropdown-menu class="w-60">
                  <button hlmDropdownMenuItem>Profile</button>
                  <button hlmDropdownMenuItem>Settings</button>
                  <button hlmDropdownMenuItem (click)="signOut()">Sign out</button>
                </hlm-dropdown-menu>
              </ng-template>
            </li>
          </ul>
        </div>
      </hlm-sidebar>
      <main hlmSidebarInset>
        <header class="px-4 py-3 border-b">
          <div class="flex items-center justify-between mb-3">
            <button hlmSidebarTrigger>
              <span class="sr-only">Toggle Sidebar</span>
            </button>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">Admin Panel</span>
            </div>
          </div>
          
          <nav hlmBreadcrumb>
            <ol hlmBreadcrumbList>
              @for (breadcrumb of breadcrumbs(); track breadcrumb.label) {
                @if (!$last) {
                  <li hlmBreadcrumbItem>
                    <a hlmBreadcrumbLink [link]="breadcrumb.url">{{ breadcrumb.label }}</a>
                  </li>
                  <li hlmBreadcrumbSeparator></li>
                } @else {
                  <li hlmBreadcrumbItem>
                    <span hlmBreadcrumbPage>{{ breadcrumb.label }}</span>
                  </li>
                }
              }
            </ol>
          </nav>
        </header>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  providers: [
    provideIcons({
      lucideChevronRight,
      lucideFolderOpen,
      lucideWallet,
      lucidePlus,
      lucideBarChart3,
      lucideHistory,
      lucideFileText,
      lucideUsers,
      lucideSettings,
      lucideShield,
      lucideUserCheck,
      lucideListChecks,
      lucideDollarSign,
      lucideTrendingUp,
      lucideArchive,
      lucideAlertCircle,
      lucideChevronUp,
    }),
  ],
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(HlmDialogService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  public readonly breadcrumbs = this.breadcrumbService.breadcrumbs;
  protected readonly _items = [
    {
      title: 'Dashboard',
      icon: 'lucideBarChart3',
      defaultOpen: true,
      items: [
        {
          title: 'Overview',
          icon: 'lucideBarChart3',
          route: ['/dashboard/overview'],
        },
        {
          title: 'System Health',
          icon: 'lucideTrendingUp',
          route: ['/dashboard/system-health'],
        },
        {
          title: 'Recent Activity',
          icon: 'lucideHistory',
          route: ['/dashboard/recent-activity'],
        },
      ],
    },
    {
      title: 'Project Management',
      icon: 'lucideFolderOpen',
      defaultOpen: false,
      items: [
        {
          title: 'Create New Project',
          icon: 'lucidePlus',
          route: ['/dashboard/projects/create'],
        },
        {
          title: 'All Projects',
          icon: 'lucideFolderOpen',
          route: ['/dashboard/projects'],
        },
        {
          title: 'Active Projects',
          icon: 'lucideTrendingUp',
          route: ['/dashboard/projects/active'],
        },
        {
          title: 'Pending Approval',
          icon: 'lucideAlertCircle',
          route: ['/dashboard/projects/pending'],
        },
        {
          title: 'Archived Projects',
          icon: 'lucideArchive',
          route: ['/dashboard/projects/archived'],
        },
        {
          title: 'Project Categories',
          icon: 'lucideListChecks',
          route: ['/dashboard/projects/categories'],
        },
      ],
    },
    {
      title: 'User Management',
      icon: 'lucideUsers',
      defaultOpen: false,
      items: [
        {
          title: 'All Users',
          icon: 'lucideUsers',
          route: ['/dashboard/users'],
        },
        {
          title: 'User Permissions',
          icon: 'lucideUserCheck',
          route: ['/dashboard/users/permissions'],
        },
        {
          title: 'User Activity',
          icon: 'lucideHistory',
          route: ['/dashboard/users/activity'],
        },
        {
          title: 'Banned Users',
          icon: 'lucideShield',
          route: ['/dashboard/users/banned'],
        },
        {
          title: 'Invite Users',
          icon: 'lucidePlus',
          route: ['/dashboard/users/invite'],
        },
      ],
    },
    {
      title: 'Contributions',
      icon: 'lucideWallet',
      defaultOpen: false,
      items: [
        {
          title: 'All Contributions',
          icon: 'lucideDollarSign',
          route: ['/dashboard/contributions'],
        },
        {
          title: 'Pending Contributions',
          icon: 'lucideAlertCircle',
          route: ['/dashboard/contributions/pending'],
        },
        {
          title: 'Contribution Reports',
          icon: 'lucideFileText',
          route: ['/dashboard/contributions/reports'],
        },
        {
          title: 'Refund Requests',
          icon: 'lucideHistory',
          route: ['/dashboard/contributions/refunds'],
        },
        {
          title: 'Transaction Logs',
          icon: 'lucideFileText',
          route: ['/dashboard/contributions/transactions'],
        },
      ],
    },
    {
      title: 'Financial Management',
      icon: 'lucideDollarSign',
      defaultOpen: false,
      items: [
        {
          title: 'Revenue Overview',
          icon: 'lucideBarChart3',
          route: ['/dashboard/financial/revenue'],
        },
        {
          title: 'Withdrawal Requests',
          icon: 'lucideWallet',
          route: ['/dashboard/financial/withdrawals'],
        },
        {
          title: 'Tax Reports',
          icon: 'lucideFileText',
          route: ['/dashboard/financial/tax'],
        },
        {
          title: 'Financial Statements',
          icon: 'lucideFileText',
          route: ['/dashboard/financial/statements'],
        },
        {
          title: 'Payment Gateways',
          icon: 'lucideSettings',
          route: ['/dashboard/financial/gateways'],
        },
      ],
    },
    {
      title: 'Analytics & Reports',
      icon: 'lucideTrendingUp',
      defaultOpen: false,
      items: [
        {
          title: 'Project Analytics',
          icon: 'lucideBarChart3',
          route: ['/dashboard/analytics/projects'],
        },
        {
          title: 'User Engagement',
          icon: 'lucideUsers',
          route: ['/dashboard/analytics/engagement'],
        },
        {
          title: 'Financial Reports',
          icon: 'lucideDollarSign',
          route: ['/dashboard/analytics/financial'],
        },
        {
          title: 'Export Data',
          icon: 'lucideFileText',
          route: ['/dashboard/analytics/export'],
        },
        {
          title: 'Custom Reports',
          icon: 'lucidePlus',
          route: ['/dashboard/analytics/custom'],
        },
      ],
    },
    {
      title: 'System Settings',
      icon: 'lucideSettings',
      defaultOpen: false,
      items: [
        {
          title: 'General Settings',
          icon: 'lucideSettings',
          route: ['/dashboard/settings/general'],
        },
        {
          title: 'Project Settings',
          icon: 'lucideFolderOpen',
          route: ['/dashboard/settings/projects'],
        },
        {
          title: 'Payment Settings',
          icon: 'lucideWallet',
          route: ['/dashboard/settings/payment'],
        },
        {
          title: 'Email Templates',
          icon: 'lucideFileText',
          route: ['/dashboard/settings/email'],
        },
        {
          title: 'Security Settings',
          icon: 'lucideShield',
          route: ['/dashboard/settings/security'],
        },
        {
          title: 'Backup & Restore',
          icon: 'lucideArchive',
          route: ['/dashboard/settings/backup'],
        },
      ],
    },
    {
      title: 'Audit Log',
      icon: 'lucideHistory',
      defaultOpen: false,
      items: [
        {
          title: 'System Logs',
          icon: 'lucideHistory',
          route: ['/dashboard/audit/system'],
        },
        {
          title: 'User Actions',
          icon: 'lucideUsers',
          route: ['/dashboard/audit/user-actions'],
        },
        {
          title: 'Security Events',
          icon: 'lucideShield',
          route: ['/dashboard/audit/security'],
        },
        {
          title: 'Export Logs',
          icon: 'lucideFileText',
          route: ['/dashboard/audit/export'],
        },
      ],
    },
  ];

  async signOut() {
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Sign Out',
        message: 'Are you sure you want to sign out?',
        confirmLabel: 'Sign Out',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      },
    });

    const result = await firstValueFrom(dialogRef.closed$);
    if (result === true) {
      this.authService.logout();
    }
  }
}

