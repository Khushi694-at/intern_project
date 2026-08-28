import type { Locator } from '@playwright/test';
import { BasePage } from '../core/BasePage';

export class LoginPage extends BasePage {
  readonly path = 'index.htm';

  private readonly usernameInput: Locator = this.page.locator('input[name="username"]');
  private readonly passwordInput: Locator = this.page.locator('input[name="password"]');
  private readonly loginButton: Locator = this.page.locator('input[value="Log In"]');

  readonly registerLink: Locator = this.page.getByRole('link', { name: 'Register' });

  async login(username: string, password: string): Promise<void> {
    this.logger.info(`Logging in as "${username}"`);
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
