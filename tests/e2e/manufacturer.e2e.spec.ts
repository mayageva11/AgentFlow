import { test, expect } from '@playwright/test';

test('create manufacturer with name and iconColor — appears in UI', async ({ page }) => {
  // Arrange
  await page.goto('/downloads');

  // Act
  await page.fill('#manufacturer-name', 'מנורה');
  await page.fill('#manufacturer-color', '#1A73E8');
  await page.click('#create-manufacturer-btn');

  // Assert
  await expect(page.locator('#manufacturer-result')).toContainText('Created');
  await expect(page.locator('#manufacturer-result')).toContainText('ID:');
});
