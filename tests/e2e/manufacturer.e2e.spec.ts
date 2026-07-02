import { test, expect } from '../fixtures/testBase';

test('create manufacturer with name and iconColor — appears in UI', async ({ downloadsPage }) => {
  // Arrange
  await downloadsPage.navigate();

  // Act
  await downloadsPage.fillManufacturerName('מנורה');
  await downloadsPage.fillManufacturerColor('#1A73E8');
  await downloadsPage.clickCreateManufacturer();

  // Assert
  await expect(downloadsPage.manufacturerResult).toContainText('Created');
  await expect(downloadsPage.manufacturerResult).toContainText('ID:');
});
