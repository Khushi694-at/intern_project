import { test, expect } from '../../src/core/api-fixtures';
import type { ApiAccount, ApiCustomer } from '../../src/data/types';

// ParaBank's permanently-seeded shared demo user (also used by the UI suite's fundedAccount fixture).
const DEMO_CUSTOMER_ID = 12212;

test.describe('Customer & accounts REST services', () => {
  test("GET customer returns the demo customer's profile", async ({ apiClient }) => {
    const response = await apiClient.getCustomer(DEMO_CUSTOMER_ID);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const customer = (await response.json()) as ApiCustomer;
    expect(customer).toMatchObject({ id: DEMO_CUSTOMER_ID, firstName: 'John', lastName: 'Smith' });
  });

  test('GET accounts for a customer returns only accounts that customer owns', async ({
    apiClient,
  }) => {
    const response = await apiClient.getAccountsForCustomer(DEMO_CUSTOMER_ID);

    expect(response.status()).toBe(200);
    const accounts = (await response.json()) as ApiAccount[];
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts.every((account) => account.customerId === DEMO_CUSTOMER_ID)).toBe(true);
    expect(
      accounts.every((account) => account.type === 'CHECKING' || account.type === 'SAVINGS'),
    ).toBe(true);
  });

  test('GET a single account by id returns its current balance', async ({ apiClient }) => {
    const accounts = (await (
      await apiClient.getAccountsForCustomer(DEMO_CUSTOMER_ID)
    ).json()) as ApiAccount[];
    const anyOwnedAccount = accounts[0];

    const response = await apiClient.getAccount(anyOwnedAccount.id);

    expect(response.status()).toBe(200);
    const account = (await response.json()) as ApiAccount;
    expect(account.id).toBe(anyOwnedAccount.id);
    expect(typeof account.balance).toBe('number');
  });

  test('login with valid credentials returns the matching customer', async ({ apiClient }) => {
    const response = await apiClient.login('john', 'demo');

    expect(response.status()).toBe(200);
    const customer = (await response.json()) as ApiCustomer;
    expect(customer.id).toBe(DEMO_CUSTOMER_ID);
  });

  test('login with an invalid password is rejected with 400', async ({ apiClient }) => {
    const response = await apiClient.login('john', 'not-the-real-password');

    expect(response.status()).toBe(400);
  });
});
