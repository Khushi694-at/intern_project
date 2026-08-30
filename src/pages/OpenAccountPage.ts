import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import type { AccountType } from '../data/types';

const TYPE_OPTION_VALUE: Record<AccountType, string> = {
  CHECKING: '0',
  SAVINGS: '1',
};

export class OpenAccountPage extends BasePage {
  readonly path = 'openaccount.htm';

  private readonly typeSelect: Locator = this.page.locator('#type');
  private readonly fromAccountSelect: Locator = this.page.locator('#fromAccountId');
  private readonly openButton: Locator = this.page.locator('input[type="button"][value="Open New Account"]');
  private readonly newAccountIdLink: Locator = this.page.locator('#newAccountId');

  /** Opens a new account funded from `fromAccountId` and returns the new account's id. */
  async openAccount(type: AccountType, fromAccountId: string): Promise<string> {
    this.logger.info(`Opening a new ${type} account funded from #${fromAccountId}`);
    // The funding-account dropdown is populated by an AJAX call after page load.
    await expect(this.fromAccountSelect.locator('option').first()).toBeAttached();
    await this.typeSelect.selectOption(TYPE_OPTION_VALUE[type]);
    await this.fromAccountSelect.selectOption(fromAccountId);
    await this.click(this.openButton);
    await expect(this.newAccountIdLink).toBeVisible();
    return this.newAccountIdLink.innerText();
  }
}
