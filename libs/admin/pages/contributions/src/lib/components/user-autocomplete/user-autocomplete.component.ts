import { Component, forwardRef, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HlmInput } from '@nyots/ui/input';
import { HlmIcon } from '@nyots/ui/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX, lucideLoader2 } from '@ng-icons/lucide';
import { IGetAllUsersQuery, UserService } from '@nyots/data-source/user';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'nyots-user-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInput,
    HlmIcon,
    NgIcon,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserAutocompleteComponent),
      multi: true,
    },
    provideIcons({
      lucideSearch,
      lucideX,
      lucideLoader2,
    }),
  ],
  template: `
    <div class="relative">
      <div class="relative">
        <ng-icon
          hlmIcon
          name="lucideSearch"
          size="base"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          hlmInput
          type="text"
          [formControl]="searchControl"
          [placeholder]="placeholder()"
          class="pl-9 pr-9"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [attr.aria-label]="'Search for user'"
          [attr.aria-expanded]="showDropdown()"
          [attr.aria-autocomplete]="'list'"
        />
        @if (loading()) {
          <ng-icon
            hlmIcon
            name="lucideLoader2"
            size="base"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
          />
        } @else if (selectedUser() && !disabled()) {
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            (click)="clearSelection()"
            [attr.aria-label]="'Clear selection'"
          >
            <ng-icon hlmIcon name="lucideX" size="base" />
          </button>
        }
      </div>

      @if (showDropdown() && filteredUsers().length > 0) {
        <div
          class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto"
          role="listbox"
        >
          @for (user of filteredUsers(); track user.id) {
            <button
              type="button"
              class="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
              (click)="selectUser(user)"
              [attr.role]="'option'"
              [attr.aria-selected]="selectedUser()?.id === user.id"
            >
              <div class="font-medium">{{ getUserName(user) }}</div>
              <div class="text-sm text-muted-foreground">{{ user.email }}</div>
            </button>
          }
        </div>
      }

      @if (showDropdown() && searchControl.value && searchControl.value.length < 2 && !loading()) {
        <div
          class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md px-3 py-2 text-sm text-muted-foreground"
        >
          Type at least 2 characters to search
        </div>
      }

      @if (showDropdown() && filteredUsers().length === 0 && searchControl.value && searchControl.value.length >= 2 && !loading()) {
        <div
          class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md px-3 py-2 text-sm text-muted-foreground"
        >
          No users found
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class UserAutocompleteComponent implements ControlValueAccessor, OnInit {
  private userService = inject(UserService);

  // Signals
  searchControl = new FormControl('');
  selectedUser = signal<IGetAllUsersQuery['getAllUsers']['edges'][number]['node'] | null >(null);
  filteredUsers = signal<IGetAllUsersQuery['getAllUsers']['edges'][number]['node'][]>([]);
  showDropdown = signal(false);
  loading = signal(false);
  disabled = signal(false);
  placeholder = signal('Search for user...');

  // ControlValueAccessor callbacks
  private onChange: (value: string | null) => void = () => {
    //
  };
  private onTouched: () => void = () => {
    //
  };

  ngOnInit() {
    // Set up search with debounce and API call
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          if (!searchTerm || searchTerm.length < 2) {
            this.filteredUsers.set([]);
            this.loading.set(false);
            return of(null);
          }

          this.loading.set(true);
          return this.searchUsers(searchTerm);
        }),
        catchError((error) => {
          console.error('Error searching users:', error);
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.filteredUsers.set(result);
        }
        this.loading.set(false);
      });
  }

  /**
   * Search users via the UserService
   */
  private async searchUsers(searchTerm: string): Promise<IGetAllUsersQuery['getAllUsers']['edges'][number]['node'][]> {
    try {
      const result = await this.userService.getAllUsers({
        search: searchTerm,
        pagination: { first: 10 }, // Limit to 10 results
      });

      if (result?.edges) {
        return result.edges.map((edge) => edge.node);
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // ControlValueAccessor implementation
  writeValue(userId: string | null): void {
    if (userId) {
      // Fetch user by ID to display their name
      this.loadUserById(userId);
    } else {
      this.selectedUser.set(null);
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  /**
   * Load user by ID for display
   */
  private async loadUserById(userId: string): Promise<void> {
    try {
      const user = await this.userService.getUserById(userId);
      if (user) {
        this.selectedUser.set(user);
        this.searchControl.setValue(this.getUserName(user), { emitEvent: false });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }

  // Component methods
  onFocus(): void {
    this.showDropdown.set(true);
    // Don't auto-load users on focus - wait for user to type
  }

  onBlur(): void {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      this.showDropdown.set(false);
      this.onTouched();
    }, 200);
  }

  selectUser(user: IGetAllUsersQuery['getAllUsers']['edges'][number]['node']): void {
    this.selectedUser.set(user);
    this.searchControl.setValue(this.getUserName(user), { emitEvent: false });
    this.showDropdown.set(false);
    this.onChange(user.id);
  }

  clearSelection(): void {
    this.selectedUser.set(null);
    this.searchControl.setValue('', { emitEvent: false });
    this.onChange(null);
    this.filteredUsers.set([]);
  }

  getUserName(user: IGetAllUsersQuery['getAllUsers']['edges'][number]['node']): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    return user.email;
  }
}
