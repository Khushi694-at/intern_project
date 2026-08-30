import type { Locator } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import type { RegistrationData } from '../data/types';

export class RegisterPage extends BasePage {
  readonly path = 'register.htm';

  readonly heading: Locator = this.page.locator('h1.title');

  private readonly firstNameInput: Locator = this.page.locator('input[name="customer.firstName"]');
  private readonly lastNameInput: Locator = this.page.locator('input[name="customer.lastName"]');
  private readonly streetInput: Locator = this.page.locator('input[name="customer.address.street"]');
  private readonly cityInput: Locator = this.page.locator('input[name="customer.address.city"]');
  private readonly stateInput: Locator = this.page.locator('input[name="customer.address.state"]');
  private readonly zipCodeInput: Locator = this.page.locator('input[name="customer.address.zipCode"]');
  private readonly phoneNumberInput: Locator = this.page.locator('input[name="customer.phoneNumber"]');
  private readonly ssnInput: Locator = this.page.locator('input[name="customer.ssn"]');
  private readonly usernameInput: Locator = this.page.locator('input[name="customer.username"]');
  private readonly passwordInput: Locator = this.page.locator('input[name="customer.password"]');
  private readonly repeatedPasswordInput: Locator = this.page.locator('input[name="repeatedPassword"]');
  private readonly submitButton: Locator = this.page.locator('input[type="submit"][value="Register"]');

  /** Field-level server-rendered error, keyed by the same name used in the request payload. */
  fieldError(field: 'customer.username' | 'customer.firstName' | 'customer.lastName'): Locator {
    return this.page.locator(`[id="${field}.errors"]`);
  }

  async register(data: RegistrationData): Promise<void> {
    this.logger.info(`Registering user "${data.username}"`);
    await this.fill(this.firstNameInput, data.firstName);
    await this.fill(this.lastNameInput, data.lastName);
    await this.fill(this.streetInput, data.street);
    await this.fill(this.cityInput, data.city);
    await this.fill(this.stateInput, data.state);
    await this.fill(this.zipCodeInput, data.zipCode);
    await this.fill(this.phoneNumberInput, data.phoneNumber);
    await this.fill(this.ssnInput, data.ssn);
    await this.fill(this.usernameInput, data.username);
    await this.fill(this.passwordInput, data.password);
    await this.fill(this.repeatedPasswordInput, data.password);
    await this.click(this.submitButton);
  }
}
