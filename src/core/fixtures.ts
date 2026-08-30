import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { OverviewPage } from '../pages/OverviewPage';
import { OpenAccountPage } from '../pages/OpenAccountPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import { BillPayPage } from '../pages/BillPayPage';
import { FindTransactionsPage } from '../pages/FindTransactionsPage';
import { createLogger, type Logger } from '../utils/logger';
import { generateRegistrationData } from '../utils/data-generator';
import type { RegistrationData } from '../data/types';

interface RegisteredCustomer {
  data: RegistrationData;
  /** The CHECKING account ParaBank auto-opens for every new registration. */
  checkingAccountId: string;
}

interface Fixtures {
  logger: Logger;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  overviewPage: OverviewPage;
  openAccountPage: OpenAccountPage;
  transferFundsPage: TransferFundsPage;
  billPayPage: BillPayPage;
  findTransactionsPage: FindTransactionsPage;
  /** A freshly registered, logged-in customer with one funded CHECKING account. */
  registeredCustomer: RegisteredCustomer;
  /** A registered customer that has also opened a second, SAVINGS account. */
  customerWithTwoAccounts: RegisteredCustomer & { savingsAccountId: string };
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
  overviewPage: async ({ page }, use) => {
    await use(new OverviewPage(page));
  },
  openAccountPage: async ({ page }, use) => {
    await use(new OpenAccountPage(page));
  },
  transferFundsPage: async ({ page }, use) => {
    await use(new TransferFundsPage(page));
  },
  billPayPage: async ({ page }, use) => {
    await use(new BillPayPage(page));
  },
  findTransactionsPage: async ({ page }, use) => {
    await use(new FindTransactionsPage(page));
  },
  registeredCustomer: async ({ registerPage, overviewPage }, use) => {
    const data = generateRegistrationData();
    await registerPage.goto();
    await registerPage.register(data);
    await expect(registerPage.heading).toHaveText(`Welcome ${data.firstName}`);

    await overviewPage.goto();
    const checkingAccountId = await overviewPage.getFirstAccountId();

    await use({ data, checkingAccountId });
  },
  customerWithTwoAccounts: async ({ registeredCustomer, openAccountPage }, use) => {
    await openAccountPage.goto();
    const savingsAccountId = await openAccountPage.openAccount('SAVINGS', registeredCustomer.checkingAccountId);
    await use({ ...registeredCustomer, savingsAccountId });
  },
});

export { expect } from '@playwright/test';
