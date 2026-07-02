import { test, expect } from '@playwright/test';

async function bodyFitsViewport(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 5);
}

test('login page fits viewport — all form fields visible', async ({ page }) => {
  // Arrange & Act
  await page.goto('/login');

  // Assert
  expect(await bodyFitsViewport(page)).toBe(true);
  await expect(page.locator('[name="email"]')).toBeVisible();
  await expect(page.locator('[name="password"]')).toBeVisible();
  await expect(page.locator('[type="submit"]')).toBeVisible();
});

test('dashboard page fits viewport — header and content visible after load', async ({ page }) => {
  // Arrange & Act
  await page.goto('/dashboard');
  await page.waitForFunction(
    () => (document.getElementById('loading') as HTMLElement).style.display === 'none',
    { timeout: 8000 }
  );

  // Assert
  expect(await bodyFitsViewport(page)).toBe(true);
  await expect(page.locator('.logo')).toBeVisible();
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
});

test('downloads page fits viewport — all three form sections visible', async ({ page }) => {
  // Arrange & Act
  await page.goto('/downloads');

  // Assert
  expect(await bodyFitsViewport(page)).toBe(true);
  await expect(page.locator('#manufacturer-name')).toBeVisible();
  await expect(page.locator('#report-manufacturer-id')).toBeVisible();
  await expect(page.locator('#upload-file')).toBeVisible();
});

test('nav links remain present in the DOM on any viewport', async ({ page }) => {
  // Arrange & Act
  await page.goto('/dashboard');

  // Assert — navigation must have exactly two links regardless of viewport
  await expect(page.locator('nav a')).toHaveCount(2);
});
