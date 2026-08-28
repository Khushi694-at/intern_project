import type { Locator, Page } from '@playwright/test';
import { createLogger, type Logger } from '../utils/logger';
import { config } from '../utils/config';

/**
 * Shared navigation/wait/action behaviour for every page object. Concrete
 * pages only declare their locators and flow-specific methods.
 */
export abstract class BasePage {
  protected readonly logger: Logger = createLogger(this.constructor.name);

  /** Path relative to the configured baseURL, e.g. "/index.htm". */
  abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async goto(): Promise<void> {
    this.logger.debug(`Navigating to ${this.path}`);
    await this.page.goto(this.path);
  }

  async waitForVisible(locator: Locator, timeoutMs: number = config.defaultTimeoutMs): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async click(locator: Locator): Promise<void> {
    await this.waitForVisible(locator);
    await locator.click();
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.fill(value);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
