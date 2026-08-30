import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import { parseCurrency } from '../utils/currency';

export class OverviewPage extends BasePage {
  readonly path = 'overview.htm';

  private readonly rows: Locator = this.page.locator('#accountTable tbody tr');

  /** The account rows load asynchronously via AJAX; wait for at least one before reading them. */
  async waitForAccountsLoaded(): Promise<void> {
    await expect(this.rows.first()).toBeVisible();
  }

  private accountRow(accountId: string): Locator {
    return this.rows.filter({ has: this.page.locator('a', { hasText: accountId }) });
  }

  async getBalance(accountId: string): Promise<number> {
    await this.waitForAccountsLoaded();
    const text = await this.accountRow(accountId).locator('td').nth(1).innerText();
    return parseCurrency(text);
  }

  async hasAccount(accountId: string): Promise<boolean> {
    await this.waitForAccountsLoaded();
    return (await this.accountRow(accountId).count()) > 0;
  }

  /** The account id of the first (most recently opened, per ParaBank's ordering) row. */
  async getFirstAccountId(): Promise<string> {
    await this.waitForAccountsLoaded();
    return this.rows.first().locator('a').innerText();
  }

  /** The "Total" row's balance, summed across every account by the page itself. */
  async getTotalBalance(): Promise<number> {
    await this.waitForAccountsLoaded();
    const text = await this.rows.last().locator('td').nth(1).innerText();
    return parseCurrency(text);
  }
}
