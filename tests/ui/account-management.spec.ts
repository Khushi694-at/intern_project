import { test, expect } from '../../src/core/fixtures';
import type { AccountType } from '../../src/data/types';

test.describe('Accounts Overview', () => {
  test('lists a freshly opened account with its exact $100 opening balance', async ({ overviewPage, fundedAccount }) => {
    await overviewPage.goto();

    expect(await overviewPage.hasAccount(fundedAccount.primaryAccountId)).toBe(true);
    expect(await overviewPage.getBalance(fundedAccount.primaryAccountId)).toBe(100);
  });
});

test.describe('Open New Account', () => {
  const ACCOUNT_TYPES: AccountType[] = ['SAVINGS', 'CHECKING'];

  for (const accountType of ACCOUNT_TYPES) {
    test(`opening a new ${accountType} account funds it with exactly $100 debited from the source account`, async ({
      openAccountPage,
      overviewPage,
      fundedAccount,
    }) => {
      const { primaryAccountId } = fundedAccount;

      await openAccountPage.goto();
      const newAccountId = await openAccountPage.openAccount(accountType, primaryAccountId);

      await overviewPage.goto();
      expect(await overviewPage.getBalance(newAccountId)).toBe(100);
      expect(await overviewPage.getBalance(primaryAccountId)).toBe(0);
    });
  }

  test('opening a new account moves money internally, so the overview total is unchanged', async ({
    openAccountPage,
    overviewPage,
    fundedAccount,
  }) => {
    await overviewPage.goto();
    const totalBefore = await overviewPage.getTotalBalance();

    await openAccountPage.goto();
    await openAccountPage.openAccount('SAVINGS', fundedAccount.primaryAccountId);

    await overviewPage.goto();
    expect(await overviewPage.getTotalBalance()).toBe(totalBefore);
  });
});
