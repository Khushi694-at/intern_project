import { test, expect } from '../../src/core/fixtures';

function todayAsMMDDYYYY(): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${mm}-${dd}-${today.getFullYear()}`;
}

test.describe('Find Transactions', () => {
  // Opening the SAVINGS account (via customerWithTwoAccounts) creates a known $100
  // transaction on each account, dated today — used as deterministic search fixtures below.

  test('finds a transaction on the newly funded account by its exact amount', async ({
    findTransactionsPage,
    customerWithTwoAccounts,
  }) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(customerWithTwoAccounts.savingsAccountId);
    await findTransactionsPage.findByAmount(100);

    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
    await expect(findTransactionsPage.resultRows.first().locator('td').nth(3)).toHaveText('$100.00');
  });

  test("finds a transaction on the funding account by today's date", async ({
    findTransactionsPage,
    customerWithTwoAccounts,
  }) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(customerWithTwoAccounts.checkingAccountId);
    await findTransactionsPage.findByDate(todayAsMMDDYYYY());

    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
  });

  test('finds a transaction on the funding account within a date range spanning today', async ({
    findTransactionsPage,
    customerWithTwoAccounts,
  }) => {
    const today = todayAsMMDDYYYY();

    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(customerWithTwoAccounts.checkingAccountId);
    await findTransactionsPage.findByDateRange(today, today);

    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
  });

  test('finds a transaction by its exact transaction id, discovered via an amount search', async ({
    findTransactionsPage,
    customerWithTwoAccounts,
  }) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(customerWithTwoAccounts.savingsAccountId);
    await findTransactionsPage.findByAmount(100);
    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
    const transactionId = await findTransactionsPage.getTransactionIdFromRow(findTransactionsPage.resultRows.first());

    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(customerWithTwoAccounts.savingsAccountId);
    await findTransactionsPage.findById(transactionId);

    await expect(findTransactionsPage.resultRows).toHaveCount(1);
    expect(await findTransactionsPage.getTransactionIdFromRow(findTransactionsPage.resultRows.first())).toBe(
      transactionId,
    );
  });

  test('finding a transaction by a non-existent id surfaces the internal error page (tracks BUG-04)', async ({
    findTransactionsPage,
    customerWithTwoAccounts,
  }) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(customerWithTwoAccounts.checkingAccountId);
    await findTransactionsPage.findById('999999999');

    await expect(findTransactionsPage.errorContainer).toContainText('An internal error has occurred and has been logged.');
  });
});
