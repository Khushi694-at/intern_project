import { test, expect } from '../../src/core/api-fixtures';
import type { ApiAccount, ApiTransaction } from '../../src/data/types';

const DEMO_CUSTOMER_ID = 12212;
const SOURCE_ACCOUNT_ID = 13344;

function todayAsMDYYYY(): string {
  const today = new Date();
  return `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
}

test.describe('Transaction-search REST services', () => {
  test('finds a freshly transferred amount, then looks up that exact transaction by id', async ({
    apiClient,
  }) => {
    const created = (await (
      await apiClient.createAccount(DEMO_CUSTOMER_ID, 'CHECKING', SOURCE_ACCOUNT_ID)
    ).json()) as ApiAccount;
    await expect
      .poll(
        async () => ((await (await apiClient.getAccount(created.id)).json()) as ApiAccount).balance,
        {
          timeout: 10_000,
        },
      )
      .toBe(100);

    const transferAmount = 42;
    await apiClient.transfer(SOURCE_ACCOUNT_ID, created.id, transferAmount);

    await expect
      .poll(
        async () => {
          const response = await apiClient.findTransactionsByAmount(created.id, transferAmount);
          return ((await response.json()) as ApiTransaction[]).length;
        },
        { timeout: 10_000 },
      )
      .toBe(1);

    const found = (await (
      await apiClient.findTransactionsByAmount(created.id, transferAmount)
    ).json()) as ApiTransaction[];
    expect(found[0].amount).toBe(transferAmount);
    expect(found[0].accountId).toBe(created.id);

    const byIdResponse = await apiClient.findTransactionById(found[0].id);
    expect(byIdResponse.status()).toBe(200);
    const byId = (await byIdResponse.json()) as ApiTransaction;
    expect(byId.id).toBe(found[0].id);
    expect(byId.accountId).toBe(created.id);
  });

  test('finding a transaction by a non-existent id is rejected with 400 (API counterpart of BUG-04)', async ({
    apiClient,
  }) => {
    const response = await apiClient.findTransactionById(999_999_999);

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain('Could not find transaction');
  });

  test('finds transactions on a newly funded account within a date range spanning today', async ({
    apiClient,
  }) => {
    const created = (await (
      await apiClient.createAccount(DEMO_CUSTOMER_ID, 'SAVINGS', SOURCE_ACCOUNT_ID)
    ).json()) as ApiAccount;
    await expect
      .poll(
        async () => ((await (await apiClient.getAccount(created.id)).json()) as ApiAccount).balance,
        {
          timeout: 10_000,
        },
      )
      .toBe(100);

    const today = todayAsMDYYYY();
    const response = await apiClient.findTransactionsByDateRange(created.id, today, today);

    expect(response.status()).toBe(200);
    const transactions = (await response.json()) as ApiTransaction[];
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions.every((t) => t.accountId === created.id)).toBe(true);
  });
});
