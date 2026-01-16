# Contributions Data Source

This library provides GraphQL queries, mutations, and services for managing contributions in the NYOTS platform.

## Features

- GraphQL queries for fetching contributions with filtering and pagination
- GraphQL mutations for creating, updating, and processing contributions
- TypeScript types generated from GraphQL schema
- Angular services for contribution management

## Usage

```typescript
import { ContributionService } from '@nyots/data-source/contributions';

// Inject the service
constructor(private contributionService: ContributionService) {}

// Get contributions
const contributions = await this.contributionService.getContributions(filter, pagination);

// Create a contribution
const contribution = await this.contributionService.createContribution(input);
```

## GraphQL Operations

### Queries
- `GetContributions` - Get contributions with filtering and pagination
- `GetContribution` - Get a single contribution by ID
- `GetMyContributions` - Get contributions for the authenticated user
- `GetProjectContributions` - Get contributions for a specific project
- `GetContributionReport` - Get contribution reports (admin only)
- `GetContributionTransactions` - Get transactions for a contribution
- `GetTransactions` - Get all transactions with filtering (admin only)

### Mutations
- `CreateContribution` - Create a new contribution
- `AdminCreateContribution` - Admin creates a contribution for any user
- `ProcessContributionPayment` - Process payment for a pending contribution
- `UpdateContributionStatus` - Update contribution status (admin only)
- `ProcessContributionRefund` - Process refund for a paid contribution (admin only)
- `BulkUpdateContributionStatus` - Bulk update contribution statuses (admin only)
