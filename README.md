# Contributor

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Finish your remote caching setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/ZHJkGjyDwB)


## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve contributor
```

To create a production bundle:

```sh
npx nx build contributor
```

To see all available targets to run for a project, run:

```sh
npx nx show project contributor
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/angular:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/angular:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
\n\n--- From: apps/backend/src/app/modules/activity/README.md ---\n\n
# Activity Module

A generic, system-wide activity logging mechanism for tracking user actions across the application.

## Overview

The Activity module provides a centralized way to log and query user activities throughout the system. It tracks who performed an action, what action was performed, what entity was affected, and additional metadata about the action.

## Features

- **Comprehensive Activity Tracking**: Log various types of user actions (login, CRUD operations, approvals, etc.)
- **Flexible Filtering**: Query activities by user, action type, target entity type, and date range
- **Pagination Support**: Cursor-based pagination for efficient data retrieval
- **Rich Metadata**: Store additional context in a JSONB field
- **GraphQL API**: Fully integrated with GraphQL for easy querying

## Database Schema

### Activity Model

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to users table |
| action | Enum | Type of action performed (see ActivityAction enum) |
| targetId | UUID | ID of the entity being acted upon (nullable) |
| targetType | Enum | Type of entity (User, Project, Contribution, etc.) |
| details | JSONB | Additional metadata as JSON string |
| createdAt | Date | Timestamp of when the activity occurred |
| updatedAt | Date | Timestamp of last update |

### Indexes

The following indexes are created for optimal query performance:
- `user_id`
- `action`
- `target_type`
- `target_id`
- `created_at`

## Activity Actions

The following actions are supported:

### User Actions
- `USER_LOGIN`
- `USER_LOGOUT`
- `USER_CREATED`
- `USER_UPDATED`
- `USER_DELETED`

### Project Actions
- `PROJECT_CREATED`
- `PROJECT_UPDATED`
- `PROJECT_DELETED`
- `PROJECT_APPROVED`
- `PROJECT_REJECTED`
- `PROJECT_ARCHIVED`

### Contribution Actions
- `CONTRIBUTION_CREATED`
- `CONTRIBUTION_UPDATED`
- `CONTRIBUTION_DELETED`

### Role Actions
- `ROLE_CREATED`
- `ROLE_UPDATED`
- `ROLE_DELETED`
- `ROLE_ASSIGNED`
- `ROLE_REVOKED`

### Permission Actions
- `PERMISSION_CREATED`
- `PERMISSION_UPDATED`
- `PERMISSION_DELETED`

### Category Actions
- `CATEGORY_CREATED`
- `CATEGORY_UPDATED`
- `CATEGORY_DELETED`

## Target Types

- `User`
- `Project`
- `Contribution`
- `Role`
- `Permission`
- `Category`

## Usage

### Logging an Activity

```typescript
import { ActivityService, ActivityAction, TargetType } from './modules/activity';

// Inject the service
constructor(private activityService: ActivityService) {}

// Log an activity
await this.activityService.logActivity({
  userId: 'user-uuid',
  action: ActivityAction.PROJECT_CREATED,
  targetId: 'project-uuid',
  targetType: TargetType.PROJECT,
  details: JSON.stringify({
    projectTitle: 'New Project',
    category: 'Technology',
    goalAmount: 10000
  })
});
```

### Querying Activities

```typescript
// Get all activities with filters
const activities = await this.activityService.getActivities(
  {
    userId: 'user-uuid',
    action: ActivityAction.PROJECT_CREATED,
    targetType: TargetType.PROJECT,
    dateRange: {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31')
    }
  },
  {
    first: 20,
    after: 'cursor-string'
  }
);
```

## GraphQL API

### Queries

#### Get Activities

```graphql
query GetActivities(
  $filter: ActivityFilter
  $pagination: PaginationInput
) {
  activities(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        userId
        action
        targetId
        targetType
        details
        createdAt
        user {
          id
          email
          firstName
          lastName
        }
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

**Variables:**
```json
{
  "filter": {
    "userId": "user-uuid",
    "action": "PROJECT_CREATED",
    "targetType": "Project",
    "dateRange": {
      "start": "2026-01-01T00:00:00Z",
      "end": "2026-01-31T23:59:59Z"
    }
  },
  "pagination": {
    "first": 20,
    "after": "cursor-string"
  }
}
```

#### Get Single Activity

```graphql
query GetActivity($id: String!) {
  activity(id: $id) {
    id
    userId
    action
    targetId
    targetType
    details
    createdAt
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

### Mutations

#### Log Activity

```graphql
mutation LogActivity($input: CreateActivityInput!) {
  logActivity(input: $input) {
    id
    userId
    action
    targetId
    targetType
    details
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "userId": "user-uuid",
    "action": "PROJECT_CREATED",
    "targetId": "project-uuid",
    "targetType": "Project",
    "details": "{\"projectTitle\":\"New Project\",\"goalAmount\":10000}"
  }
}
```

## Integration Examples

### Logging Project Creation

```typescript
// In ProjectService
async createProject(input: CreateProjectInput, userId: string): Promise<Project> {
  const project = await this.projectModel.create(input);
  
  // Log the activity
  await this.activityService.logActivity({
    userId,
    action: ActivityAction.PROJECT_CREATED,
    targetId: project.id,
    targetType: TargetType.PROJECT,
    details: JSON.stringify({
      title: project.title,
      goalAmount: project.goalAmount,
      categoryId: project.categoryId
    })
  });
  
  return project;
}
```

### Logging User Login

```typescript
// In AuthService
async login(email: string): Promise<LoginResponse> {
  const user = await this.userService.findByEmail(email);
  
  // Log the login activity
  await this.activityService.logActivity({
    userId: user.id,
    action: ActivityAction.USER_LOGIN,
    details: JSON.stringify({
      loginTime: new Date(),
      ipAddress: '192.168.1.1' // Get from request
    })
  });
  
  return { token, user };
}
```

## Migration

To apply the database migration:

```bash
# Run migrations
npx sequelize-cli db:migrate

# Rollback if needed
npx sequelize-cli db:migrate:undo
```

## Best Practices

1. **Always log significant actions**: Create, update, delete operations, approvals, role changes, etc.
2. **Include relevant context**: Use the `details` field to store additional information that might be useful for auditing
3. **Be consistent**: Use the predefined action enums rather than creating custom strings
4. **Consider privacy**: Don't log sensitive information like passwords or payment details in the details field
5. **Use appropriate target types**: Always specify the targetType when logging actions on specific entities

## Future Enhancements

- Add activity aggregation queries (e.g., activities per day/week/month)
- Implement activity retention policies
- Add support for bulk activity logging
- Create activity dashboards and analytics
- Add webhook notifications for specific activities
\n\n--- From: apps/backend/src/app/modules/activity/schemas/README.md ---\n\n
# Activity Module GraphQL Schemas

This directory contains the GraphQL schema definitions for the Activity module.

## Files

### activity.graphql
Defines the core Activity type, enums, and connection types:
- `Activity` type with all fields
- `ActivityAction` enum (25 actions)
- `TargetType` enum (6 types)
- `ActivityConnection` and `ActivityEdge` for pagination

### activity-inputs.graphql
Defines input types for mutations and queries:
- `CreateActivityInput` - For creating new activities
- `ActivityFilter` - For filtering activities in queries
- `ActivityDateRangeInput` - For date range filtering
- `ActivityPaginationInput` - For pagination

### activity-queries.graphql
Defines GraphQL queries:
- `activities` - Get paginated list of activities with optional filters
- `activity` - Get a single activity by ID

### activity-mutations.graphql
Defines GraphQL mutations:
- `logActivity` - Create a new activity log entry

## Schema-First Approach

This project uses GraphQL schema-first approach, meaning:
1. GraphQL types are defined in `.graphql` files (not TypeScript decorators)
2. Resolvers reference these schema definitions by name
3. TypeScript types/classes are used for validation and business logic only

## Example Query

```graphql
query GetActivities {
  activities(
    filter: {
      userId: "user-uuid"
      action: USER_LOGIN
    }
    pagination: {
      first: 20
    }
  ) {
    edges {
      node {
        id
        action
        targetType
        details
        createdAt
        user {
          email
          firstName
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

## Example Mutation

```graphql
mutation LogActivity {
  logActivity(input: {
    userId: "user-uuid"
    action: PROJECT_CREATED
    targetId: "project-uuid"
    targetType: Project
    details: "{\"title\":\"New Project\"}"
  }) {
    id
    action
    createdAt
  }
}
```
\n\n--- From: libs/admin/pages/auth/README.md ---\n\n
# @nyots/admin-pages/auth-callback

Secondary entry point of `@nyots/admin-pages`. It can be used by importing from `@nyots/client-pages/login`.
\n\n--- From: libs/admin/pages/users/README.md ---\n\n
# admin-pages-users

This library contains the user management pages for the admin dashboard.

## Features

- All Users - View and manage all registered users
- User Permissions - Manage user roles and permissions
- User Activity - Track user activity and engagement
- Banned Users - Manage banned or suspended users
- Invite Users - Send invitations to new users

## Usage

Import the routes in your dashboard routing:

```typescript
{
  path: 'users',
  loadChildren: () => import('@nyots/admin-pages/users').then(m => m.usersRoutes)
}
```
