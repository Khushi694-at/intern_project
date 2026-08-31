import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import type { BillPayData } from '../data/types';

export type BillPayValidationField =
  | 'name'
  | 'address'
  | 'city'
  | 'state'
  | 'zipCode'
  | 'phoneNumber'
  | 'account-empty'
  | 'account-invalid'
  | 'verifyAccount-empty'
  | 'verifyAccount-invalid'
  | 'verifyAccount-mismatch'
  | 'amount-empty'
  | 'amount-invalid';

export class BillPayPage extends BasePage {
  readonly path = 'billpay.htm';

  private readonly payeeNameInput: Locator = this.page.locator('input[name="payee.name"]');
  private readonly streetInput: Locator = this.page.locator('input[name="payee.address.street"]');
  private readonly cityInput: Locator = this.page.locator('input[name="payee.address.city"]');
  private readonly stateInput: Locator = this.page.locator('input[name="payee.address.state"]');
  private readonly zipCodeInput: Locator = this.page.locator('input[name="payee.address.zipCode"]');
  private readonly phoneNumberInput: Locator = this.page.locator('input[name="payee.phoneNumber"]');
  private readonly accountNumberInput: Locator = this.page.locator('input[name="payee.accountNumber"]');
  private readonly verifyAccountNumberInput: Locator = this.page.locator('input[name="verifyAccount"]');
  private readonly amountInput: Locator = this.page.locator('input[name="amount"]');
  private readonly fromAccountSelect: Locator = this.page.locator('select[name="fromAccountId"]');
  private readonly sendPaymentButton: Locator = this.page.locator('input[type="button"][value="Send Payment"]');

  readonly resultHeading: Locator = this.page.locator('#billpayResult h1.title');
  readonly resultText: Locator = this.page.locator('#billpayResult p').first();

  validationError(field: BillPayValidationField): Locator {
    return this.page.locator(`[id="validationModel-${field}"]`);
  }

  /** Fills every field without submitting, for negative tests that leave some fields blank. */
  async fillForm(data: Partial<BillPayData>): Promise<void> {
    if (data.payeeName !== undefined) await this.fill(this.payeeNameInput, data.payeeName);
    if (data.address?.street !== undefined) await this.fill(this.streetInput, data.address.street);
    if (data.address?.city !== undefined) await this.fill(this.cityInput, data.address.city);
    if (data.address?.state !== undefined) await this.fill(this.stateInput, data.address.state);
    if (data.address?.zipCode !== undefined) await this.fill(this.zipCodeInput, data.address.zipCode);
    if (data.phoneNumber !== undefined) await this.fill(this.phoneNumberInput, data.phoneNumber);
    if (data.accountNumber !== undefined) await this.fill(this.accountNumberInput, data.accountNumber);
    if (data.verifyAccountNumber !== undefined) await this.fill(this.verifyAccountNumberInput, data.verifyAccountNumber);
    if (data.amount !== undefined) await this.fill(this.amountInput, String(data.amount));
    if (data.fromAccountId !== undefined) {
      await expect(this.fromAccountSelect.locator('option').first()).toBeAttached();
      await this.fromAccountSelect.selectOption(data.fromAccountId);
    }
  }

  async submit(): Promise<void> {
    await this.click(this.sendPaymentButton);
  }

  async payBill(data: BillPayData): Promise<void> {
    this.logger.info(`Paying "${data.payeeName}" ${data.amount} from #${data.fromAccountId}`);
    await this.fillForm(data);
    await this.submit();
    await expect(this.resultHeading).toBeVisible();
  }
}
