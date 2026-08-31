import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import type { TransferFundsData } from '../data/types';

export class TransferFundsPage extends BasePage {
  readonly path = 'transfer.htm';

  private readonly amountInput: Locator = this.page.locator('#amount');
  private readonly fromAccountSelect: Locator = this.page.locator('#fromAccountId');
  private readonly toAccountSelect: Locator = this.page.locator('#toAccountId');
  private readonly submitButton: Locator = this.page.locator('input[type="submit"][value="Transfer"]');

  readonly resultHeading: Locator = this.page.locator('#showResult h1.title');
  readonly resultText: Locator = this.page.locator('#showResult p').first();

  async transfer(data: TransferFundsData): Promise<void> {
    this.logger.info(`Transferring ${data.amount} from #${data.fromAccountId} to #${data.toAccountId}`);
    await expect(this.fromAccountSelect.locator('option').first()).toBeAttached();
    await this.fill(this.amountInput, String(data.amount));
    await this.fromAccountSelect.selectOption(data.fromAccountId);
    await this.toAccountSelect.selectOption(data.toAccountId);
    await this.click(this.submitButton);
    await expect(this.resultHeading).toBeVisible();
  }
}
