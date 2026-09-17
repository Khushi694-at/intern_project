import Database from 'better-sqlite3';
import * as path from 'node:path';

export interface AccountRecord {
  accountId: number;
  customerId: number;
  accountType: 'CHECKING' | 'SAVINGS';
  balance: number;
}

export interface TransactionRecord {
  transactionId: number;
  accountId: number;
  type: 'Debit' | 'Credit';
  amount: number;
  description: string;
  transactionDate: string;
}

export interface TransactionWithOwner extends TransactionRecord {
  firstName: string;
  lastName: string;
}

export interface CustomerBalanceSummary {
  customerId: number;
  firstName: string;
  lastName: string;
  accountCount: number;
  totalBalance: number;
}

interface AccountRow {
  account_id: number;
  customer_id: number;
  account_type: string;
  balance: number;
}

interface TransactionRow {
  transaction_id: number;
  account_id: number;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
}

interface TransactionWithOwnerRow extends TransactionRow {
  first_name: string;
  last_name: string;
}

interface CustomerBalanceSummaryRow {
  customer_id: number;
  first_name: string;
  last_name: string;
  account_count: number;
  total_balance: number;
}

const DEFAULT_DB_PATH = path.join(__dirname, '../../sql/bank.sqlite');

function toAccountRecord(row: AccountRow): AccountRecord {
  return {
    accountId: row.account_id,
    customerId: row.customer_id,
    accountType: row.account_type as AccountRecord['accountType'],
    balance: row.balance,
  };
}

function toTransactionRecord(row: TransactionRow): TransactionRecord {
  return {
    transactionId: row.transaction_id,
    accountId: row.account_id,
    type: row.type as TransactionRecord['type'],
    amount: row.amount,
    description: row.description,
    transactionDate: row.transaction_date,
  };
}

/**
 * Read-only access to the seeded bank schema (sql/schema.sql). Callers are expected to have run
 * `npm run sql:seed` (or let Playwright's globalSetup do it) before opening this — it errors
 * loudly via `fileMustExist` rather than silently creating an empty database.
 */
export class BankDatabase {
  private readonly db: Database.Database;

  constructor(dbPath: string = DEFAULT_DB_PATH) {
    this.db = new Database(dbPath, { readonly: true, fileMustExist: true });
  }

  /** SELECT + WHERE: every account owned by one customer. */
  getAccountsForCustomer(customerId: number): AccountRecord[] {
    const rows = this.db
      .prepare<[number], AccountRow>(
        'SELECT account_id, customer_id, account_type, balance FROM accounts WHERE customer_id = ?',
      )
      .all(customerId);
    return rows.map(toAccountRecord);
  }

  /** SELECT + WHERE (range): transactions on one account at/above a minimum amount. */
  getTransactionsAboveAmount(accountId: number, minAmount: number): TransactionRecord[] {
    const rows = this.db
      .prepare<[number, number], TransactionRow>(
        `SELECT transaction_id, account_id, type, amount, description, transaction_date
         FROM transactions WHERE account_id = ? AND amount >= ? ORDER BY amount DESC`,
      )
      .all(accountId, minAmount);
    return rows.map(toTransactionRecord);
  }

  /** JOIN: transactions on an account with the owning customer's name attached. */
  getTransactionsWithOwner(accountId: number): TransactionWithOwner[] {
    const rows = this.db
      .prepare<[number], TransactionWithOwnerRow>(
        `SELECT t.transaction_id, t.account_id, t.type, t.amount, t.description, t.transaction_date,
                c.first_name, c.last_name
         FROM transactions t
         JOIN accounts a ON a.account_id = t.account_id
         JOIN customers c ON c.customer_id = a.customer_id
         WHERE t.account_id = ?
         ORDER BY t.transaction_id`,
      )
      .all(accountId);
    return rows.map((row) => ({
      ...toTransactionRecord(row),
      firstName: row.first_name,
      lastName: row.last_name,
    }));
  }

  /** JOIN + GROUP BY: per-customer account count and total balance across all their accounts. */
  getCustomerBalanceSummary(): CustomerBalanceSummary[] {
    const rows = this.db
      .prepare<[], CustomerBalanceSummaryRow>(
        `SELECT c.customer_id, c.first_name, c.last_name,
                COUNT(a.account_id) AS account_count,
                SUM(a.balance) AS total_balance
         FROM customers c
         JOIN accounts a ON a.customer_id = c.customer_id
         GROUP BY c.customer_id, c.first_name, c.last_name
         ORDER BY total_balance DESC`,
      )
      .all();
    return rows.map((row) => ({
      customerId: row.customer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      accountCount: row.account_count,
      totalBalance: row.total_balance,
    }));
  }

  close(): void {
    this.db.close();
  }
}
