export class BulkUpdateError {
  contributionId: string;
  error: string;
}

export class BulkUpdateResult {
  successCount: number;
  failureCount: number;
  errors: BulkUpdateError[];
}
