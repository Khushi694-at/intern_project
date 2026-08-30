import { test, expect } from '../../src/core/fixtures';
import type { AccountType } from '../../src/data/types';

test.describe('Accounts Overview', () => {
  test('lists the auto-opened checking account with its seeded opening balance', async ({
    overviewPage,
    registeredCustomer,
  }) => {
    await overviewPage.goto();

    expect(await overviewPage.hasAccount(registeredCustomer.checkingAccountId)).toBe(true);
    expect(await overviewPage.getBalance(registeredCustomer.checkingAccountId)).toBe(515.5);
  });
});

test.describe('Open New Account', () => {
  const ACCOUNT_TYPES: AccountType[] = ['SAVINGS', 'CHECKING'];

  for (const accountType of ACCOUNT_TYPES) {
    test(`opening a new ${accountType} account funds it with exactly $100 debited from the source account`, async ({
      openAccountPage,
      overviewPage,
      registeredCustomer,
    }) => {
      const { checkingAccountId } = registeredCustomer;

      await openAccountPage.goto();
      const newAccountId = await openAccountPage.openAccount(accountType, checkingAccountId);

      await overviewPage.goto();
      expect(await overviewPage.getBalance(newAccountId)).toBe(100);
      expect(await overviewPage.getBalance(checkingAccountId)).toBe(415.5);
    });
  }

  test('opening a new account moves money internally, so the overview total is unchanged', async ({
    openAccountPage,
    overviewPage,
    registeredCustomer,
  }) => {
    await overviewPage.goto();
    const totalBefore = await overviewPage.getTotalBalance();

    await openAccountPage.goto();
    await openAccountPage.openAccount('SAVINGS', registeredCustomer.checkingAccountId);

    await overviewPage.goto();
    expect(await overviewPage.getTotalBalance()).toBe(totalBefore);
  });
});
