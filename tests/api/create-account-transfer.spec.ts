import { test, expect } from '../../src/core/api-fixtures';
import type { ParaBankApiClient } from '../../src/core/ParaBankApiClient';
import type { ApiAccount } from '../../src/data/types';

const DEMO_CUSTOMER_ID = 12212;
// John's SAVINGS account on the shared demo instance; also drained by the UI suite's
// fundedAccount fixture, so its balance is expected to drift down over a full CI run.
const SOURCE_ACCOUNT_ID = 13344;

async function pollBalance(apiClient: ParaBankApiClient, accountId: number) {
  return expect
    .poll(
      async () => {
        const account = (await (await apiClient.getAccount(accountId)).json()) as ApiAccount;
        return account.balance;
      },
      {
        timeout: 10_000,
        message: `Waiting for account #${accountId}'s $100 opening deposit to land`,
      },
    )
    .toBe(100);
}

test.describe('Create-account & transfer REST services', () => {
  test('creating a CHECKING account funds it with the $100 opening deposit', async ({
    apiClient,
  }) => {
    const createResponse = await apiClient.createAccount(
      DEMO_CUSTOMER_ID,
      'CHECKING',
      SOURCE_ACCOUNT_ID,
    );

    expect(createResponse.status()).toBe(200);
    const created = (await createResponse.json()) as ApiAccount;
    expect(created.customerId).toBe(DEMO_CUSTOMER_ID);
    expect(created.type).toBe('CHECKING');

    // The opening deposit is applied by an async internal transfer moments after creation
    // (the raw createAccount response itself reports balance: 0) — poll rather than assert once.
    await pollBalance(apiClient, created.id);
  });

  test('transferring funds between two owned accounts moves the exact amount both ways', async ({
    apiClient,
  }) => {
    const created = (await (
      await apiClient.createAccount(DEMO_CUSTOMER_ID, 'SAVINGS', SOURCE_ACCOUNT_ID)
    ).json()) as ApiAccount;
    await pollBalance(apiClient, created.id);

    const transferResponse = await apiClient.transfer(SOURCE_ACCOUNT_ID, created.id, 30);
    expect(transferResponse.status()).toBe(200);

    await expect
      .poll(
        async () => ((await (await apiClient.getAccount(created.id)).json()) as ApiAccount).balance,
        {
          timeout: 10_000,
        },
      )
      .toBe(130);
  });
});
