# My Activity Component

A client-facing activity timeline that allows users to view their own activity history on the platform.

## Overview

The My Activity component provides users with a personal activity timeline showing their actions such as logins, profile updates, project creations, and contributions. This feature enhances transparency and helps users track their engagement with the platform.

## Features

### 🔒 User-Specific Filtering

- **Automatic Filtering**: Activities are automatically filtered by the current user's ID
- **Privacy**: Users can only see their own activities, not others'
- **Authentication**: Requires user to be logged in

### 📊 Timeline Display

- **Chronological Order**: Activities displayed from newest to oldest
- **Visual Timeline**: Clean, easy-to-read timeline with icons
- **Color-Coded Actions**: Different colors for different activity types
- **Relative Timestamps**: "5 minutes ago", "2 hours ago", etc.
- **Full Timestamps**: Hover to see complete date and time

### 🎨 Activity Types Displayed

**User Actions:**
- Login events
- Profile updates

**Project Actions:**
- Project creation

**Contribution Actions:**
- Contribution creation
- Payment processing (success/failure)
- Refunds

### 📄 Pagination

- **20 Activities Per Page**: Default page size
- **Next/Previous Navigation**: Easy page navigation
- **Smooth Scrolling**: Auto-scroll to top on page change
- **Page Info**: Shows current count and total

### 🔄 Real-Time Updates

- **Refresh Button**: Manual refresh to see latest activities
- **Loading States**: Clear loading indicators
- **Error Handling**: Toast notifications for errors

## User-Friendly Descriptions

The component generates human-readable descriptions for each activity:

| Action | Description Example |
|--------|-------------------|
| USER_LOGIN | "You logged into your account" |
| USER_UPDATED | "You updated your profile (email, firstName)" |
| PROJECT_CREATED | "You created a new project 'Community Garden'" |
| CONTRIBUTION_CREATED | "You made a contribution of $100" |
| CONTRIBUTION_UPDATED (success) | "Your payment of $50 was processed successfully" |
| CONTRIBUTION_UPDATED (failure) | "Your payment failed: Card declined" |
| CONTRIBUTION_UPDATED (refund) | "Your contribution of $75 was refunded" |

## Implementation Details

### Authentication

The component retrieves the current user from localStorage:

```typescript
currentUser = computed(() => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
});
```

### GraphQL Query

Activities are fetched using the `activities` query with user ID filter:

```typescript
const filter = {
  userId: user.id, // Only current user's activities
};

this.activityService.getActivities(filter, pagination).subscribe({
  next: (result) => {
    // Handle results
  }
});
```

### Security

- **Client-Side Filtering**: User ID filter ensures only own activities are shown
- **Server-Side Validation**: Backend should also validate user permissions
- **No Sensitive Data**: Passwords and tokens are never displayed

## Component Structure

```typescript
MyActivityComponent
├── State (Signals)
│   ├── activities
│   ├── isLoading
│   ├── hasNextPage
│   ├── hasPreviousPage
│   ├── totalCount
│   └── currentCursor
├── Computed
│   └── currentUser (from localStorage)
├── Methods
│   ├── loadActivities()
│   ├── nextPage()
│   ├── previousPage()
│   ├── refresh()
│   ├── getActionIcon()
│   ├── getActionColor()
│   ├── getActivityDescription()
│   ├── getActionLabel()
│   ├── formatTimestamp()
│   └── formatFullTimestamp()
└── Template
    ├── Header with Refresh
    ├── Activity Timeline Card
    │   ├── Loading State
    │   ├── Empty State
    │   └── Timeline Items
    ├── Pagination
    └── Info Card
```

## Usage

### Navigation

Users can access their activity from the dashboard sidebar:

```
Dashboard → My Activity
```

### Route

```
/dashboard/my-activity
```

### Breadcrumb

```
Dashboard > My Activity
```

## UI/UX Features

### Visual Design

- **Clean Timeline**: Vertical timeline with connecting lines
- **Contextual Icons**: Different icons for different actions
- **Color Coding**: Visual distinction between action types
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: Semantic HTML and ARIA labels

### Empty State

When no activities exist:
- Friendly message
- Helpful suggestions
- Encourages engagement

### Loading State

- Centered spinner
- Loading message
- Disabled buttons during load

### Error Handling

- Toast notifications
- User-friendly error messages
- Graceful degradation

## Action Icons & Colors

| Action | Icon | Color |
|--------|------|-------|
| USER_LOGIN | Login | Green |
| USER_UPDATED | Edit | Blue |
| PROJECT_CREATED | Folder Plus | Purple |
| CONTRIBUTION_CREATED | Dollar Sign | Indigo |
| CONTRIBUTION_UPDATED | Check Circle | Emerald |

## Integration Points

### Dashboard Sidebar

Added to `dashboard.ts`:

```typescript
{
  title: 'My Activity',
  icon: 'lucideHistory',
  route: '/dashboard/my-activity',
}
```

### Dashboard Routes

Added to `dashboard-routes.ts`:

```typescript
{
  path: 'my-activity',
  data: { breadcrumb: 'My Activity' },
  loadComponent: () => import('./my-activity/my-activity.component')
    .then(m => m.MyActivityComponent)
}
```

### Activity Service

Uses `ActivityService` from `@nyots/data-source/activity`:

```typescript
this.activityService.getActivities(filter, pagination)
```

## Performance

- **Lazy Loading**: Component is lazy-loaded
- **Pagination**: Only loads 20 activities at a time
- **Efficient Queries**: Filtered by user ID at database level
- **Signal-Based**: Reactive updates without unnecessary re-renders

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus indicators
- **Color Contrast**: WCAG AA compliant

## Future Enhancements

Potential improvements:

1. **Activity Filtering**
   - Filter by action type
   - Filter by date range
   - Search functionality

2. **Export**
   - Download activity history as CSV
   - Email activity report

3. **Activity Details**
   - Click to see full details
   - View related entities

4. **Notifications**
   - Badge showing new activities
   - Push notifications for important events

5. **Analytics**
   - Activity summary
   - Engagement metrics
   - Contribution totals

## Testing

### Manual Testing

- [ ] Load page - activities display
- [ ] Empty state - shows when no activities
- [ ] Loading state - shows during fetch
- [ ] Pagination - next/previous work
- [ ] Refresh - reloads data
- [ ] Timestamps - display correctly
- [ ] Descriptions - are user-friendly
- [ ] Icons - match action types
- [ ] Colors - are appropriate
- [ ] Mobile - responsive layout

### User Scenarios

1. **New User**: Should see empty state with helpful message
2. **Active User**: Should see timeline of recent activities
3. **Long History**: Should be able to paginate through activities
4. **After Action**: Should see new activity after performing action

## Troubleshooting

### Activities Not Loading

1. Check user is authenticated
2. Verify user ID in localStorage
3. Check GraphQL endpoint
4. Check browser console for errors

### Empty Timeline

1. User may not have any activities yet
2. Check if backend is logging activities
3. Verify user ID filter is correct

### Pagination Not Working

1. Check cursor values
2. Verify hasNextPage/hasPreviousPage
3. Check backend pagination implementation

## Related Documentation

- [Activity Module Backend](../../../../../../apps/backend/src/app/modules/activity/README.md)
- [Activity Service](../../../../../../libs/shared/data-source/activity/src/lib/activity.service.ts)
- [Admin Activity Page](../../../../../../libs/admin/pages/users/src/lib/pages/user-activity/README.md)
