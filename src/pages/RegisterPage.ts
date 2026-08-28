import type { Locator } from '@playwright/test';
import { BasePage } from '../core/BasePage';

export class RegisterPage extends BasePage {
  readonly path = 'register.htm';

  readonly heading: Locator = this.page.locator('h1.title');
}
