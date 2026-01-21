# User Activity Component

A comprehensive audit trail component for the admin portal that displays user activities with advanced filtering and timeline visualization.

## Features

### 🔍 Advanced Filtering

The component provides multiple filter options:

1. **User ID Filter**
   - Filter activities by specific user ID
   - Leave empty to show all users

2. **Action Type Filter**
   - 20+ action types available
   - Includes user, project, contribution, and role actions
   - Dropdown with human-readable labels

3. **Target Type Filter**
   - Filter by entity type (User, Project, Contribution, etc.)
   - Helps narrow down activities to specific resource types

4. **Date Range Filter**
   - Start and end date/time pickers
   - Filter activities within specific time periods
   - Useful for compliance and audit reports

5. **Results Per Page**
   - Configurable page size (10, 20, 50, 100)
   - Optimizes loading performance

### 📊 Timeline Display

Activities are displayed in a clean timeline format:

- **Visual Timeline**: Vertical line connecting activities with icons
- **Action Icons**: Contextual icons for each action type
- **Color-Coded Badges**: Different colors for different action types
- **User Information**: Name, email, and user ID
- **Timestamps**: Relative time (e.g., "5 minutes ago") with full timestamp on hover
- **Descriptions**: Human-readable descriptions generated from activity details
- **Metadata**: Target ID, user ID, and target type
- **Details Expansion**: Collapsible JSON details for debugging

### 🎨 Action Types & Colors

| Action | Color | Icon |
|--------|-------|------|
| USER_LOGIN | Green | Login |
| USER_LOGOUT | Gray | Logout |
| USER_CREATED | Blue | User |
| USER_UPDATED | Yellow | Edit |
| USER_DELETED | Red | Trash |
| PROJECT_CREATED | Blue | Folder Plus |
| PROJECT_UPDATED | Yellow | Edit |
| PROJECT_DELETED | Red | Trash |
| PROJECT_APPROVED | Green | Check Circle |
| PROJECT_REJECTED | Red | X Circle |
| PROJECT_ARCHIVED | Gray | File Text |
| CONTRIBUTION_CREATED | Indigo | Dollar Sign |
| CONTRIBUTION_UPDATED | Yellow | Edit |
| CONTRIBUTION_DELETED | Red | Trash |
| ROLE_ASSIGNED | Green | Check Circle |
| ROLE_REVOKED | Red | X Circle |

### 🔄 Real-Time Updates

- **Auto-Refresh**: Filters trigger automatic reload with debounce (500ms)
- **Manual Refresh**: Refresh button to reload current view
- **Loading States**: Spinner and loading indicators
- **Error Handling**: Toast notifications for errors

### 📄 Pagination

- **Cursor-Based**: Efficient pagination using GraphQL cursors
- **Next/Previous**: Navigation buttons with disabled states
- **Page Info**: Shows current results and total count
- **Configurable Size**: Adjustable results per page

## GraphQL Integration

### Query Used

```graphql
query GetActivities(
  $filter: ActivityFilter
  $pagination: ActivityPaginationInput
) {
  activities(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        userId
        user {
          id
          email
          firstName
          lastName
        }
        action
        targetId
        targetType
        details
        createdAt
        updatedAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Filter Options

```typescript
interface ActivityFilter {
  userId?: string;
  action?: ActivityAction;
  targetType?: TargetType;
  dateRange?: {
    start: string;
    end: string;
  };
}
```

### Pagination Options

```typescript
interface ActivityPaginationInput {
  first?: number;
  after?: string;
}
```

## Component Architecture

### State Management

Uses Angular signals for reactive state:

```typescript
activities = signal<ActivityNode[]>([]);
isLoading = signal(false);
hasNextPage = signal(false);
hasPreviousPage = signal(false);
totalCount = signal(0);
currentCursor = signal<string | null>(null);
```

### Form Management

Reactive forms with auto-reload on changes:

```typescript
filterForm = new FormGroup({
  userId: new FormControl<string>(''),
  action: new FormControl<IActivityAction | ''>(''),
  targetType: new FormControl<ITargetType | ''>(''),
  startDate: new FormControl<string>(''),
  endDate: new FormControl<string>(''),
  pageSize: new FormControl<number>(20),
});
```

### Services Used

1. **ActivityService**: Fetches activities from GraphQL API
2. **UserService**: (Available for future user lookup features)

## Usage

### Basic Usage

```typescript
import { UserActivityComponent } from './pages/user-activity/user-activity.component';

// In your routing or component
{
  path: 'activity',
  component: UserActivityComponent
}
```

### Standalone Component

The component is fully standalone and includes all necessary imports:

```typescript
@Component({
  selector: 'nyots-user-activity',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInput,
    HlmLabel,
    HlmButton,
    HlmCard,
    // ... other UI components
  ],
  // ...
})
```

## Key Methods

### `loadActivities()`
Fetches activities from the API with current filters and pagination.

### `nextPage()` / `previousPage()`
Navigate through paginated results.

### `clearFilters()`
Reset all filters to default values.

### `refresh()`
Reload current view with existing filters.

### `getUserName(activity)`
Get formatted user name from activity.

### `getActionIcon(action)`
Get appropriate icon for action type.

### `getActionBadgeClass(action)`
Get CSS classes for action badge styling.

### `getActivityDescription(activity)`
Generate human-readable description from activity details.

### `formatTimestamp(date)`
Format timestamp as relative time (e.g., "5 minutes ago").

### `formatFullTimestamp(date)`
Format timestamp as full date/time string.

## Styling

The component uses:
- **Tailwind CSS**: For utility classes
- **shadcn/ui**: For consistent UI components
- **Dark Mode Support**: All colors have dark mode variants
- **Responsive Design**: Mobile-friendly layout

## Performance Optimizations

1. **Debounced Filters**: 500ms debounce on filter changes
2. **Cursor Pagination**: Efficient database queries
3. **Lazy Loading**: Only loads visible activities
4. **Signal-Based**: Reactive updates without unnecessary re-renders
5. **Track By**: Optimized list rendering with `track activity.id`

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus indicators
- **Color Contrast**: WCAG AA compliant colors

## Future Enhancements

Potential improvements:

1. **Export Functionality**: Export activities to CSV/PDF
2. **Advanced Search**: Full-text search in descriptions
3. **Bulk Actions**: Select and export multiple activities
4. **Real-Time Updates**: WebSocket integration for live updates
5. **Activity Details Modal**: Detailed view in a modal
6. **User Lookup**: Autocomplete for user ID filter
7. **Saved Filters**: Save and load filter presets
8. **Activity Charts**: Visualize activity trends over time

## Testing

### Unit Tests

```typescript
describe('UserActivityComponent', () => {
  it('should load activities on init', () => {
    // Test implementation
  });

  it('should filter activities by action type', () => {
    // Test implementation
  });

  it('should paginate results', () => {
    // Test implementation
  });
});
```

### E2E Tests

```typescript
describe('User Activity Page', () => {
  it('should display activity timeline', () => {
    // Test implementation
  });

  it('should filter by date range', () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Activities Not Loading

1. Check GraphQL endpoint is accessible
2. Verify authentication token is valid
3. Check browser console for errors
4. Ensure backend migration has been run

### Filters Not Working

1. Check filter values are being set correctly
2. Verify GraphQL query accepts filter parameters
3. Check debounce timing (500ms delay)

### Pagination Issues

1. Verify cursor values are being passed correctly
2. Check `hasNextPage` and `hasPreviousPage` values
3. Ensure backend supports cursor-based pagination

## Related Documentation

- [Activity Module Backend](../../../../../../../apps/backend/src/app/modules/activity/README.md)
- [Activity Service](../../../../../../../libs/shared/data-source/activity/src/lib/activity.service.ts)
- [GraphQL Schema](../../../../../../../apps/backend/src/app/modules/activity/schemas/README.md)
