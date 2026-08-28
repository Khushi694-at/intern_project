import { test, expect } from '../../src/core/fixtures';

test.describe('Smoke: UI harness sanity', () => {
  test('home page loads and shows the login form', async ({ loginPage, page }) => {
    await loginPage.goto();

    await expect(page).toHaveTitle(/ParaBank/i);
    await expect(loginPage.registerLink).toBeVisible();
  });

  test('register link navigates to the registration page', async ({ loginPage, registerPage, page }) => {
    await loginPage.goto();
    await loginPage.registerLink.click();

    await expect(page).toHaveURL(/register\.htm/);
    await expect(registerPage.heading).toBeVisible();
  });
});
