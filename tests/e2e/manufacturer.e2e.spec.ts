import { test, expect } from '@playwright/test';
import { createManufacturer } from '../helpers/manufacturerHelper';

test('create manufacturer with name and iconColor — appears in UI', async ({ page }) => {
  // Arrange
  await page.goto('/downloads');

  // Act
  await page.fill('#manufacturer-name', 'מנורה');
  await page.fill('#manufacturer-color', '#1A73E8');
  await page.fill('#manufacturer-agency', 'agency-ui-test');
  await page.click('#create-manufacturer-btn');

  // Assert
  await expect(page.locator('#manufacturer-result')).toContainText('Created');
  await expect(page.locator('#manufacturer-result')).toContainText('ID:');
});

test('manufacturer belongs to current agency only', async ({ request }) => {
  // Arrange
  const { id } = await createManufacturer(request, {
    name: 'Isolated Corp',
    iconColor: '#FF5733',
    agencyId: 'agency-isolated',
  });

  // Act — different agency tries to access the manufacturer
  const response = await request.get(`/api/manufacturer/${id}?agencyId=agency-other`);

  // Assert
  expect(response.status()).toBe(404);
});
