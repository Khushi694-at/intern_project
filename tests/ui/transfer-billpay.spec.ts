import { test, expect } from '../../src/core/fixtures';
import { generateBillPayData } from '../../src/utils/data-generator';

test.describe('Transfer Funds', () => {
  test('transferring funds between two owned accounts moves the exact amount both ways', async ({
    transferFundsPage,
    overviewPage,
    customerWithTwoAccounts,
  }) => {
    const { checkingAccountId, savingsAccountId } = customerWithTwoAccounts;

    await transferFundsPage.goto();
    await transferFundsPage.transfer({ amount: 50, fromAccountId: checkingAccountId, toAccountId: savingsAccountId });

    await expect(transferFundsPage.resultText).toContainText('$50.00');

    await overviewPage.goto();
    expect(await overviewPage.getBalance(checkingAccountId)).toBe(365.5);
    expect(await overviewPage.getBalance(savingsAccountId)).toBe(150);
  });

  test('transferring more than the available balance still succeeds and drives the source account negative (tracks BUG-01)', async ({
    transferFundsPage,
    overviewPage,
    customerWithTwoAccounts,
  }) => {
    const { checkingAccountId, savingsAccountId } = customerWithTwoAccounts;

    await transferFundsPage.goto();
    await transferFundsPage.transfer({
      amount: 999_999,
      fromAccountId: checkingAccountId,
      toAccountId: savingsAccountId,
    });

    await expect(transferFundsPage.resultHeading).toHaveText('Transfer Complete!');

    await overviewPage.goto();
    expect(await overviewPage.getBalance(checkingAccountId)).toBe(415.5 - 999_999);
    expect(await overviewPage.getBalance(savingsAccountId)).toBe(100 + 999_999);
  });
});

test.describe('Bill Pay', () => {
  test('paying a bill debits the paying account by the exact payment amount', async ({
    billPayPage,
    overviewPage,
    registeredCustomer,
  }) => {
    const { checkingAccountId } = registeredCustomer;
    const payment = generateBillPayData({ fromAccountId: checkingAccountId, amount: 25 });

    await billPayPage.goto();
    await billPayPage.payBill(payment);

    await expect(billPayPage.resultText).toContainText('$25.00');

    await overviewPage.goto();
    expect(await overviewPage.getBalance(checkingAccountId)).toBe(490.5);
  });

  test('submitting with required fields left blank surfaces a validation message per field', async ({
    billPayPage,
    registeredCustomer,
  }) => {
    await billPayPage.goto();
    await billPayPage.fillForm({
      payeeName: 'Electric Co',
      amount: 25,
      fromAccountId: registeredCustomer.checkingAccountId,
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
    registeredCustomer,
  }) => {
    const { checkingAccountId } = registeredCustomer;
    const payment = generateBillPayData({
      fromAccountId: checkingAccountId,
      accountNumber: checkingAccountId,
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
    registeredCustomer,
  }) => {
    const { checkingAccountId } = registeredCustomer;
    const payment = generateBillPayData({ fromAccountId: checkingAccountId, amount: -50 });

    await billPayPage.goto();
    await billPayPage.payBill(payment);

    await expect(billPayPage.resultHeading).toHaveText('Bill Payment Complete');

    await overviewPage.goto();
    expect(await overviewPage.getBalance(checkingAccountId)).toBe(515.5 + 50);
  });
});
