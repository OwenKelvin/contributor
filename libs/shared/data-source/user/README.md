# @nyots/data-source/user

This library provides GraphQL-based data access services for user management operations.

## Features

- User CRUD operations (Create, Read, Update, Delete)
- User search and filtering
- Pagination support
- Bulk user updates
- User ban/unban functionality
- Role management

## Usage

Import the `UserService` in your component or service:

```typescript
import { UserService } from '@nyots/data-source/user';

export class MyComponent {
  private userService = inject(UserService);

  async loadUsers() {
    const result = await this.userService.getAllUsers({
      search: 'john',
      pagination: { first: 20 }
    });
    console.log(result);
  }
}
```

## Available Methods

### Queries

- `getAllUsers(params)` - Get all users with optional search, filters, and pagination
- `getUserById(id)` - Get a single user by ID
- `getBannedUsers(pagination)` - Get all banned users

### Mutations

- `createUser(input)` - Create a new user
- `updateUser(id, input)` - Update an existing user
- `deleteUser(id)` - Delete a user
- `bulkUpdateUsers(ids, input)` - Update multiple users at once
- `banUser(id, reason)` - Ban a user
- `unbanUser(id)` - Unban a user

## GraphQL Code Generation

The TypeScript types and Apollo Angular services are auto-generated from GraphQL queries.

To regenerate after modifying `users.gql`:

```bash
pnpm graphql-codegen:dataSource
```

## Dependencies

- `@nyots/data-source` - Core types and interfaces
- `apollo-angular` - GraphQL client
- `rxjs` - Reactive programming
