
import { Component } from '@angular/core';
import {
  HlmSidebar,
  HlmSidebarContent,
  HlmSidebarFooter,
  HlmSidebarGroup,
  HlmSidebarGroupContent,
  HlmSidebarGroupLabel,
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
  lucideChevronDown, lucideChevronUp
} from '@ng-icons/lucide';
import { HlmCollapsible, HlmCollapsibleContent, HlmCollapsibleTrigger } from '@nyots/ui/collapsible';

@Component({
  imports: [
    HlmSidebar,
    HlmSidebarContent,
    HlmSidebarFooter,
    HlmSidebarGroup,
    HlmSidebarHeader,
    HlmSidebarWrapper,
    HlmSidebarGroupLabel,
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
  ],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar>
        <div hlmSidebarHeader class="flex items-center gap-2 px-4 py-3">
          <div class="flex items-center w-full">
            <ng-icon hlm name="lucideWallet" size="24" class="mr-2" />
            <span class="text-lg font-semibold">Contributions Hub</span>
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
                          <ng-icon [name]="item.icon" hlm size="18" />
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
                              <button hlmSidebarMenuSubButton class="w-full">
                                <span>{{ subItem.title }}</span>
                              </button>
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
      </hlm-sidebar>
      <main hlmSidebarInset>
        <header class="flex h-12 items-center justify-between px-4">
          <button hlmSidebarTrigger>
            <span class="sr-only">Toggle Sidebar</span>
          </button>
        </header>
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
      lucideChevronUp
    }),
  ],
})
export class Dashboard {
  protected readonly _items = [
    {
      title: 'Projects',
      icon: 'lucideFolderOpen',
      defaultOpen: true,
      items: [
        { title: 'Browse All Projects' },
        { title: 'Active Projects' },
        { title: 'Completed Projects' },
        { title: 'Favorite Projects' },
      ],
    },
    {
      title: 'My Contributions',
      icon: 'lucideWallet',
      defaultOpen: false,
      items: [
        { title: 'Overview' },
        { title: 'By Project' },
        { title: 'By Date' },
        { title: 'Recurring Contributions' },
        { title: 'Pending Contributions' },
      ],
    },
    {
      title: 'Make Contribution',
      icon: 'lucidePlus',
      defaultOpen: false,
      items: [
        { title: 'One-time Contribution' },
        { title: 'Set Up Recurring' },
        { title: 'Quick Contribute' },
        { title: 'Custom Amount' },
      ],
    },
    {
      title: 'Reports & Analytics',
      icon: 'lucideBarChart3',
      defaultOpen: false,
      items: [
        { title: 'Contribution Summary' },
        { title: 'Impact Dashboard' },
        { title: 'Monthly Reports' },
        { title: 'Tax Documents' },
      ],
    },
    {
      title: 'History',
      icon: 'lucideHistory',
      defaultOpen: false,
      items: [
        { title: 'Transaction History' },
        { title: 'Receipts' },
        { title: 'Export History' },
      ],
    },
  ];
}
