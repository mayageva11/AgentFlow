import { test } from '../fixtures/testBase';

test('create manufacturer with name and iconColor — appears in UI', async ({ downloadsPage }) => {
  // Arrange
  await downloadsPage.navigate();

  // Act
  await downloadsPage.createManufacturer('מנורה', '#1A73E8');

  // Assert
  await downloadsPage.assertManufacturerCreated();
});
