import { test, expect } from '../../src/core/fixtures';
import { ParaBankApiClient } from '../../src/core/ParaBankApiClient';
import type { ApiAccount } from '../../src/data/types';

const DEMO_CUSTOMER_ID = 12212;
const SOURCE_ACCOUNT_ID = 13344;
const SHARED_DEMO_CREDENTIALS = { username: 'john', password: 'demo' };

test.describe('Hybrid: API seeds an account, UI verifies it', () => {
  test('an account opened via the REST API appears in the UI overview with its funded balance', async ({
    request,
    loginPage,
    overviewPage,
  }) => {
    const apiClient = new ParaBankApiClient(request);

    const created = (await (
      await apiClient.createAccount(DEMO_CUSTOMER_ID, 'CHECKING', SOURCE_ACCOUNT_ID)
    ).json()) as ApiAccount;

    // The $100 opening deposit lands via an async internal transfer moments after creation.
    await expect
      .poll(
        async () => ((await (await apiClient.getAccount(created.id)).json()) as ApiAccount).balance,
        {
          timeout: 10_000,
        },
      )
      .toBe(100);

    await loginPage.goto();
    await loginPage.login(SHARED_DEMO_CREDENTIALS.username, SHARED_DEMO_CREDENTIALS.password);

    await overviewPage.goto();
    const accountId = String(created.id);
    expect(await overviewPage.hasAccount(accountId)).toBe(true);
    expect(await overviewPage.getBalance(accountId)).toBe(100);
  });
});
