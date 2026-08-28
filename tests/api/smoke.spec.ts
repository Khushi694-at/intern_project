import { test, expect } from '@playwright/test';
import { config } from '../../src/utils/config';

test.describe('Smoke: API harness sanity', () => {
  test('accounts endpoint responds as JSON when Accept header is set', async ({ request }) => {
    // Account 13344 belongs to ParaBank's seeded demo user (john/demo), which
    // persists across the shared instance's periodic data resets.
    const response = await request.get(`${config.apiBaseUrl}/accounts/13344`, {
      headers: { Accept: 'application/json' },
    });

    expect(response.headers()['content-type']).toContain('application/json');
  });
});
