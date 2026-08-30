import { test, expect } from '../../src/core/fixtures';
import { generateBillPayData } from '../../src/utils/data-generator';

test.describe('Transfer Funds', () => {
  test('transferring funds between two owned accounts moves the exact amount both ways', async ({
    transferFundsPage,
    overviewPage,
    twoFundedAccounts,
  }) => {
    const { primaryAccountId, secondaryAccountId } = twoFundedAccounts;

    await transferFundsPage.goto();
    await transferFundsPage.transfer({ amount: 50, fromAccountId: primaryAccountId, toAccountId: secondaryAccountId });

    await expect(transferFundsPage.resultText).toContainText('$50.00');

    await overviewPage.goto();
    expect(await overviewPage.getBalance(primaryAccountId)).toBe(50);
    expect(await overviewPage.getBalance(secondaryAccountId)).toBe(150);
  });

  test('transferring more than the available balance still succeeds and drives the source account negative (tracks BUG-01)', async ({
    transferFundsPage,
    overviewPage,
    twoFundedAccounts,
  }) => {
    const { primaryAccountId, secondaryAccountId } = twoFundedAccounts;

    await transferFundsPage.goto();
    await transferFundsPage.transfer({
      amount: 999_999,
      fromAccountId: primaryAccountId,
      toAccountId: secondaryAccountId,
    });

    await expect(transferFundsPage.resultHeading).toHaveText('Transfer Complete!');

    await overviewPage.goto();
    expect(await overviewPage.getBalance(primaryAccountId)).toBe(100 - 999_999);
    expect(await overviewPage.getBalance(secondaryAccountId)).toBe(100 + 999_999);
  });
});

test.describe('Bill Pay', () => {
  test('paying a bill debits the paying account by the exact payment amount', async ({
    billPayPage,
    overviewPage,
    fundedAccount,
  }) => {
    const { primaryAccountId } = fundedAccount;
    const payment = generateBillPayData({ fromAccountId: primaryAccountId, amount: 25 });

    await billPayPage.goto();
    await billPayPage.payBill(payment);

    await expect(billPayPage.resultText).toContainText('$25.00');

    await overviewPage.goto();
    expect(await overviewPage.getBalance(primaryAccountId)).toBe(75);
  });

  test('submitting with required fields left blank surfaces a validation message per field', async ({
    billPayPage,
    fundedAccount,
  }) => {
    await billPayPage.goto();
    await billPayPage.fillForm({
      payeeName: 'Electric Co',
      amount: 25,
      fromAccountId: fundedAccount.primaryAccountId,
    });
    await billPayPage.submit();

    await expect(billPayPage.validationError('address')).toBeVisible();
    await expect(billPayPage.validationError('city')).toBeVisible();
    await expect(billPayPage.validationError('state')).toBeVisible();
    await expect(billPayPage.validationError('zipCode')).toBeVisible();
    await expect(billPayPage.validationError('phoneNumber')).toBeVisible();
    await expect(billPayPage.validationError('account-empty')).toBeVisible();
    await expect(billPayPage.validationError('verifyAccount-empty')).toBeVisible();
    await expect(billPayPage.resultHeading).toBeHidden();
  });

  test('an account number that does not match its verification field is rejected', async ({
    billPayPage,
    fundedAccount,
  }) => {
    const { primaryAccountId } = fundedAccount;
    const payment = generateBillPayData({
      fromAccountId: primaryAccountId,
      accountNumber: primaryAccountId,
      verifyAccountNumber: '99999999',
    });

    await billPayPage.goto();
    await billPayPage.fillForm(payment);
    await billPayPage.submit();

    await expect(billPayPage.validationError('verifyAccount-mismatch')).toBeVisible();
    await expect(billPayPage.resultHeading).toBeHidden();
  });

  test('a negative payment amount is accepted and credits the paying account instead of being rejected (tracks BUG-02)', async ({
    billPayPage,
    overviewPage,
    fundedAccount,
  }) => {
    const { primaryAccountId } = fundedAccount;
    const payment = generateBillPayData({ fromAccountId: primaryAccountId, amount: -50 });

    await billPayPage.goto();
    await billPayPage.payBill(payment);

    await expect(billPayPage.resultHeading).toHaveText('Bill Payment Complete');

    await overviewPage.goto();
    expect(await overviewPage.getBalance(primaryAccountId)).toBe(150);
  });
});
