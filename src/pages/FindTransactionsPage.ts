import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from '../core/BasePage';

export class FindTransactionsPage extends BasePage {
  readonly path = 'findtrans.htm';

  private readonly accountSelect: Locator = this.page.locator('#accountId');
  private readonly transactionIdInput: Locator = this.page.locator('#transactionId');
  private readonly findByIdButton: Locator = this.page.locator('#findById');
  private readonly transactionDateInput: Locator = this.page.locator('#transactionDate');
  private readonly findByDateButton: Locator = this.page.locator('#findByDate');
  private readonly fromDateInput: Locator = this.page.locator('#fromDate');
  private readonly toDateInput: Locator = this.page.locator('#toDate');
  private readonly findByDateRangeButton: Locator = this.page.locator('#findByDateRange');
  private readonly amountInput: Locator = this.page.locator('#amount');
  private readonly findByAmountButton: Locator = this.page.locator('#findByAmount');

  readonly resultRows: Locator = this.page.locator('#transactionBody tr');
  readonly errorContainer: Locator = this.page.locator('#errorContainer');

  async selectAccount(accountId: string): Promise<void> {
    await expect(this.accountSelect.locator('option').first()).toBeAttached();
    await this.accountSelect.selectOption(accountId);
  }

  async findById(transactionId: string): Promise<void> {
    await this.fill(this.transactionIdInput, transactionId);
    await this.click(this.findByIdButton);
  }

  /** `date` must be in MM-DD-YYYY format, as required by the form. */
  async findByDate(date: string): Promise<void> {
    await this.fill(this.transactionDateInput, date);
    await this.click(this.findByDateButton);
  }

  async findByDateRange(fromDate: string, toDate: string): Promise<void> {
    await this.fill(this.fromDateInput, fromDate);
    await this.fill(this.toDateInput, toDate);
    await this.click(this.findByDateRangeButton);
  }

  async findByAmount(amount: number): Promise<void> {
    await this.fill(this.amountInput, String(amount));
    await this.click(this.findByAmountButton);
  }

  /** Reads the transaction id out of the first result row's description link. */
  async getTransactionIdFromRow(row: Locator): Promise<string> {
    const href = await row.locator('a').getAttribute('href');
    const id = href?.split('id=')[1];
    if (!id) throw new Error(`Could not parse transaction id from href "${href}"`);
    return id;
  }
}
