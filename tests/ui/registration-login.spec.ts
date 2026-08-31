import { test, expect } from '../../src/core/fixtures';
import { generateRegistrationData } from '../../src/utils/data-generator';
import type { RegistrationData } from '../../src/data/types';

const REGISTRATION_LOCATIONS: Array<Pick<RegistrationData, 'city' | 'state'>> = [
  { city: 'Los Angeles', state: 'CA' },
  { city: 'New York', state: 'NY' },
];

test.describe('Registration', () => {
  for (const location of REGISTRATION_LOCATIONS) {
    test(`registering a new customer in ${location.state} auto-logs in and opens a funded checking account`, async ({
      registerPage,
      overviewPage,
    }) => {
      const dataset = generateRegistrationData(location);
      await registerPage.goto();
      await registerPage.register(dataset);

      await expect(registerPage.heading).toHaveText(`Welcome ${dataset.firstName}`);

      await overviewPage.goto();
      const checkingAccountId = await overviewPage.getFirstAccountId();
      expect(await overviewPage.getBalance(checkingAccountId)).toBe(515.5);
    });
  }

  test('registering with required fields left blank shows a validation message per field', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register(generateRegistrationData({ firstName: '', lastName: '' }));

    await expect(registerPage.fieldError('customer.firstName')).toHaveText('First name is required.');
    await expect(registerPage.fieldError('customer.lastName')).toHaveText('Last name is required.');
  });

  test('registering with a username that already exists shows an inline error and does not create a new account', async ({
    registerPage,
    registeredCustomer,
  }) => {
    await registerPage.goto();
    await registerPage.register(generateRegistrationData({ username: registeredCustomer.data.username }));

    await expect(registerPage.fieldError('customer.username')).toHaveText('This username already exists.');
    await expect(registerPage.heading).toHaveText('Signing up is easy!');
  });
});

test.describe('Login', () => {
  test('a registered customer can log out and log back in with the same credentials', async ({
    page,
    loginPage,
    overviewPage,
    registeredCustomer,
  }) => {
    await page.getByRole('link', { name: 'Log Out' }).click();
    await expect(loginPage.registerLink).toBeVisible();

    await loginPage.login(registeredCustomer.data.username, registeredCustomer.data.password);

    await overviewPage.waitForAccountsLoaded();
    await expect(page).toHaveURL(/overview\.htm/);
  });

  test('logging in with the wrong password shows an error and does not grant access', async ({
    page,
    loginPage,
    registeredCustomer,
  }) => {
    await page.getByRole('link', { name: 'Log Out' }).click();

    await loginPage.login(registeredCustomer.data.username, 'not-the-real-password');

    await expect(loginPage.errorMessage).toHaveText('The username and password could not be verified.');
  });

  test('logging in with an unknown username shows the same verification error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('no-such-user-should-exist', 'whatever123');

    await expect(loginPage.errorMessage).toHaveText('The username and password could not be verified.');
  });
});
