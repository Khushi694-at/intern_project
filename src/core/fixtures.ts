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

/**
 * ParaBank's public demo has no dedicated per-test tenant, and its registration endpoint isn't
 * always available (the shared instance can reject every new signup — see registration-login.spec.ts).
 * These journeys don't need a *new* customer though, just an account nobody else's test will touch,
 * so they log into the permanently-seeded demo user and open fresh accounts under it instead.
 */
const SHARED_DEMO_CREDENTIALS = { username: 'john', password: 'demo' };

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
  /** Logged into the shared demo user, with one freshly opened, exactly-$100 account nobody else owns. */
  fundedAccount: { primaryAccountId: string; sourceAccountId: string };
  /** As `fundedAccount`, plus a second freshly opened $100 account for cross-account journeys. */
  twoFundedAccounts: { primaryAccountId: string; secondaryAccountId: string };
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
  fundedAccount: async ({ loginPage, overviewPage, openAccountPage }, use) => {
    await loginPage.goto();
    await loginPage.login(SHARED_DEMO_CREDENTIALS.username, SHARED_DEMO_CREDENTIALS.password);

    await overviewPage.goto();
    const sourceAccountId = await overviewPage.getFirstAccountId();

    await openAccountPage.goto();
    const primaryAccountId = await openAccountPage.openAccount('CHECKING', sourceAccountId);

    await use({ primaryAccountId, sourceAccountId });
  },
  twoFundedAccounts: async ({ fundedAccount, openAccountPage }, use) => {
    await openAccountPage.goto();
    const secondaryAccountId = await openAccountPage.openAccount('SAVINGS', fundedAccount.sourceAccountId);

    await use({ primaryAccountId: fundedAccount.primaryAccountId, secondaryAccountId });
  },
});

export { expect } from '@playwright/test';
