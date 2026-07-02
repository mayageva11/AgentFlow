import { test, expect } from '../fixtures/testBase';

test('login page fits viewport — all form fields visible', async ({ loginPage }) => {
  // Arrange & Act
  await loginPage.navigate();

  // Assert
  expect(await loginPage.fitsViewport()).toBe(true);
  await expect(loginPage.emailInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.submitButton).toBeVisible();
});

test('dashboard page fits viewport — header and content visible after load', async ({ dashboardPage }) => {
  // Arrange & Act
  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  // Assert
  expect(await dashboardPage.fitsViewport()).toBe(true);
  await expect(dashboardPage.logo).toBeVisible();
  await expect(dashboardPage.nav).toBeVisible();
  await expect(dashboardPage.heading).toBeVisible();
});

test('downloads page fits viewport — all three form sections visible', async ({ downloadsPage }) => {
  // Arrange & Act
  await downloadsPage.navigate();

  // Assert
  expect(await downloadsPage.fitsViewport()).toBe(true);
  await expect(downloadsPage.manufacturerNameInput).toBeVisible();
  await expect(downloadsPage.reportManufacturerIdInput).toBeVisible();
  await expect(downloadsPage.fileInput).toBeVisible();
});

test('nav links remain present in the DOM on any viewport', async ({ dashboardPage }) => {
  // Arrange & Act
  await dashboardPage.navigate();

  // Assert — navigation must have exactly two links regardless of viewport
  await expect(dashboardPage.navLinks).toHaveCount(2);
});
