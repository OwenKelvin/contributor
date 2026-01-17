import { Transaction } from '../transaction.model';

export class TransactionEdge {
  node: Transaction;
  cursor: string;
}
