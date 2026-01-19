
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
  HlmSidebarMenuItem, HlmSidebarMenuSub, HlmSidebarMenuSubButton, HlmSidebarMenuSubItem,
  HlmSidebarTrigger,
  HlmSidebarWrapper
} from '@nyots/ui/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@nyots/ui/icon';
import {
  lucideBarChart3,
  lucideChevronRight,
  lucideFileText,
  lucideFolderOpen, lucideHistory,
  lucidePlus,
  lucideWallet,
  lucideChevronDown, lucideChevronUp,
  lucideHome
} from '@ng-icons/lucide';
import { HlmCollapsible, HlmCollapsibleContent, HlmCollapsibleTrigger } from '@nyots/ui/collapsible';
import { NgOptimizedImage } from '@angular/common';
import { HlmDropdownMenu, HlmDropdownMenuItem, HlmDropdownMenuTrigger } from '@nyots/ui/dropdown-menu';
import { ConfirmationDialogComponent, HlmDialogService } from '@nyots/ui/dialog';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@nyots/data-source/auth';
import { RouterOutlet, RouterLink } from '@angular/router';
import {
  BreadcrumbService,
  HlmBreadcrumb,
  HlmBreadcrumbItem,
  HlmBreadcrumbLink,
  HlmBreadcrumbList,
  HlmBreadcrumbPage,
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
    HlmDropdownMenu,
    HlmSidebarFooter,
    HlmDropdownMenuItem,
    HlmDropdownMenuTrigger,
    RouterOutlet,
    RouterLink,
    HlmBreadcrumb,
    HlmBreadcrumbItem,
    HlmBreadcrumbLink,
    HlmBreadcrumbList,
    HlmBreadcrumbPage,
    HlmBreadcrumbSeparator,
  ],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar>
        <div hlmSidebarHeader class="flex items-center gap-2 px-4 py-3">
          <div class="flex items-center w-full">
            <img class="w-16" ngSrc="/logo.svg" width="472" height="472" alt="" priority="" />
            <span class="ms-4 text-lg font-semibold">NyotsCo.</span>
          </div>
        </div>
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <div hlmSidebarGroupContent>
              <ul hlmSidebarMenu>
                @for (item of _items; track item.title) {
                  @if (item.route) {
                    <li hlmSidebarMenuItem>
                      <a
                        hlmSidebarMenuButton
                        [routerLink]="item.route"
                        class="flex items-center gap-2"
                      >
                        <ng-icon [name]="item.icon" hlm size="sm" />
                        <span>{{ item.title }}</span>
                      </a>
                    </li>
                  } @else {
                    <hlm-collapsible
                      [expanded]="!!item.defaultOpen"
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
                                  hlmSidebarMenuSubButton
                                  [routerLink]="getRoutePath(subItem)"
                                  [queryParams]="getQueryParams(subItem)"
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
          <div class="flex items-center mb-3">
            <button hlmSidebarTrigger>
              <span class="sr-only">Toggle Sidebar</span>
            </button>
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
      lucideChevronDown,
      lucideChevronUp,
      lucideHome,
    }),
  ],
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(HlmDialogService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  
  protected readonly breadcrumbs = this.breadcrumbService.breadcrumbs;
  protected readonly _items = [
    {
      title: 'Overview',
      icon: 'lucideHome',
      route: '/dashboard/overview',
    },
    {
      title: 'Projects',
      icon: 'lucideFolderOpen',
      defaultOpen: false as boolean,
      items: [
        { 
          title: 'Browse All Projects', 
          icon: 'lucideFolderOpen', 
          routePath: '/dashboard/projects',
          queryParams: { filter: 'all' }
        },
        { 
          title: 'Active Projects', 
          icon: 'lucideBarChart3', 
          routePath: '/dashboard/projects',
          queryParams: { filter: 'active' }
        },
      ],
    },
    {
      title: 'My Contributions',
      icon: 'lucideWallet',
      defaultOpen: false as boolean,
      items: [
        { 
          title: 'All Contributions', 
          icon: 'lucideBarChart3', 
          routePath: '/dashboard/contributions/my-contributions',
          queryParams: { view: 'all' }
        },
        { 
          title: 'By Project', 
          icon: 'lucideFolderOpen', 
          routePath: '/dashboard/contributions/my-contributions',
          queryParams: { view: 'by-project' }
        },
      ],
    },
    {
      title: 'Make Contribution',
      icon: 'lucidePlus',
      route: '/dashboard/contributions/create',
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

  getRoutePath(subItem: any): string {
    return subItem.routePath || subItem.route;
  }

  getQueryParams(subItem: any): any {
    return subItem.queryParams || null;
  }
}
