import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { createLogger, type Logger } from '../utils/logger';

interface Fixtures {
  logger: Logger;
  loginPage: LoginPage;
  registerPage: RegisterPage;
}

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright's fixture signature requires this shape.
  logger: async ({}, use) => {
    await use(createLogger('test'));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
});

export { expect } from '@playwright/test';
