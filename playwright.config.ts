import { defineConfig, devices } from '@playwright/test';
import { config } from './src/utils/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Several UI tests share ParaBank's single persistent seeded demo account (no dedicated
  // per-test account, since registration isn't always available on the shared instance) and
  // assert on its balance deltas — run serially so parallel workers can't race each other's
  // transfers/payments against it.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: config.baseUrl,
    actionTimeout: config.defaultTimeoutMs,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
