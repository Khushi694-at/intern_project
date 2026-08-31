import { test, expect } from '../../src/core/fixtures';

function todayAsMMDDYYYY(): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${mm}-${dd}-${today.getFullYear()}`;
}

test.describe('Find Transactions', () => {
  // twoFundedAccounts opens both accounts via "Open New Account", which creates a known $100
  // opening-deposit transaction, dated today, on each — used as deterministic search fixtures below.

  test('finds a transaction on the newly funded account by its exact amount', async ({
    findTransactionsPage,
    twoFundedAccounts,
  }) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(twoFundedAccounts.secondaryAccountId);
    await findTransactionsPage.findByAmount(100);

    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
    await expect(findTransactionsPage.resultRows.first().locator('td').nth(3)).toHaveText('$100.00');
  });

  test("finds a transaction on the primary account by today's date", async ({
    findTransactionsPage,
    twoFundedAccounts,
  }) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(twoFundedAccounts.primaryAccountId);
    await findTransactionsPage.findByDate(todayAsMMDDYYYY());

    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
  });

  test('finds a transaction on the primary account within a date range spanning today', async ({
    findTransactionsPage,
    twoFundedAccounts,
  }) => {
    const today = todayAsMMDDYYYY();

    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(twoFundedAccounts.primaryAccountId);
    await findTransactionsPage.findByDateRange(today, today);

    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
  });

  test('finds a transaction by its exact transaction id, discovered via an amount search', async ({
    findTransactionsPage,
    twoFundedAccounts,
  }) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(twoFundedAccounts.secondaryAccountId);
    await findTransactionsPage.findByAmount(100);
    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
    const transactionId = await findTransactionsPage.getTransactionIdFromRow(findTransactionsPage.resultRows.first());

    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(twoFundedAccounts.secondaryAccountId);
    await findTransactionsPage.findById(transactionId);

    await expect(findTransactionsPage.resultRows).toHaveCount(1);
    expect(await findTransactionsPage.getTransactionIdFromRow(findTransactionsPage.resultRows.first())).toBe(
      transactionId,
    );
  });

  test('finding a transaction by a non-existent id surfaces the internal error page (tracks BUG-04)', async ({
    findTransactionsPage,
    twoFundedAccounts,
  }) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(twoFundedAccounts.primaryAccountId);
    await findTransactionsPage.findById('999999999');

    await expect(findTransactionsPage.errorContainer).toContainText('An internal error has occurred and has been logged.');
  });
});
