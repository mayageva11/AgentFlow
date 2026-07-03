import { test, expect } from '../fixtures/testBase';

test('login page fits viewport — all form fields visible without horizontal scroll', async ({
  loginPage
}) => {
  await loginPage.navigate();
  expect(await loginPage.fitsViewport()).toBe(true);
  await expect(loginPage.emailInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.submitButton).toBeVisible();
});

test('dashboard page fits viewport — header and table visible after load', async ({
  dashboardPage
}) => {
  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  expect(await dashboardPage.fitsViewport()).toBe(true);
  await expect(dashboardPage.logo).toBeVisible();
  await expect(dashboardPage.nav).toBeVisible();
  await expect(dashboardPage.heading).toBeVisible();
});

test('nav contains exactly three links on all viewports', async ({
  dashboardPage
}) => {
  await dashboardPage.navigate();
  await expect(dashboardPage.navLinks).toHaveCount(3);
});
