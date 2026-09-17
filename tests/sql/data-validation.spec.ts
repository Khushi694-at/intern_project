import { test, expect } from '@playwright/test';
import { BankDatabase } from '../../src/data/db';

const JOHN_CUSTOMER_ID = 1001; // seeded in sql/seed-data.sql: John Smith, 2 accounts (5001, 5002)
const JOHN_CHECKING_ACCOUNT_ID = 5001;

test.describe('SQL data validation (sql/schema.sql, seeded via globalSetup)', () => {
  let db: BankDatabase;

  test.beforeAll(() => {
    db = new BankDatabase();
  });

  test.afterAll(() => {
    db.close();
  });

  test('WHERE: returns only the accounts owned by the requested customer', () => {
    const accounts = db.getAccountsForCustomer(JOHN_CUSTOMER_ID);

    expect(accounts).toHaveLength(2);
    expect(accounts.every((account) => account.customerId === JOHN_CUSTOMER_ID)).toBe(true);
    expect(accounts.map((account) => account.accountId).sort()).toEqual([5001, 5002]);
  });

  test('WHERE (range): only transactions at/above the minimum amount come back, on the requested account', () => {
    const transactions = db.getTransactionsAboveAmount(JOHN_CHECKING_ACCOUNT_ID, 100);

    expect(transactions).toHaveLength(3);
    expect(
      transactions.every((t) => t.accountId === JOHN_CHECKING_ACCOUNT_ID && t.amount >= 100),
    ).toBe(true);
    // ORDER BY amount DESC
    expect(transactions.map((t) => t.amount)).toEqual([500, 250, 120]);
  });

  test('JOIN: each transaction row carries the name of the customer who owns its account', () => {
    const transactions = db.getTransactionsWithOwner(JOHN_CHECKING_ACCOUNT_ID);

    expect(transactions.length).toBeGreaterThan(0);
    for (const transaction of transactions) {
      expect(transaction).toMatchObject({ firstName: 'John', lastName: 'Smith' });
    }
  });

  test("JOIN + GROUP BY: each customer's total equals the sum of their own account balances", () => {
    const summary = db.getCustomerBalanceSummary();
    const john = summary.find((row) => row.customerId === JOHN_CUSTOMER_ID);
    const johnsAccounts = db.getAccountsForCustomer(JOHN_CUSTOMER_ID);
    const expectedTotal = johnsAccounts.reduce((sum, account) => sum + account.balance, 0);

    expect(john).toBeDefined();
    expect(john?.accountCount).toBe(johnsAccounts.length);
    expect(john?.totalBalance).toBeCloseTo(expectedTotal, 2);
    // Summary is ordered by total balance descending; John (4700.50) should outrank Jane (800.00).
    expect(summary[0].customerId).toBe(JOHN_CUSTOMER_ID);
  });
});
