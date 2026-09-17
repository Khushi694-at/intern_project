import { test as base, expect } from '@playwright/test';
import { ParaBankApiClient } from './ParaBankApiClient';
import { pauseForRequestPacing } from './request-pacing';

interface ApiFixtures {
  apiClient: ParaBankApiClient;
  /** Auto-fixture: not requested directly, just paces requests below ParaBank's CI rate limit. */
  requestPacing: void;
}

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ParaBankApiClient(request));
  },
  requestPacing: [
    // eslint-disable-next-line no-empty-pattern -- Playwright's fixture signature requires this shape.
    async ({}, use) => {
      await use();
      await pauseForRequestPacing();
    },
    { auto: true },
  ],
});

export { expect };
