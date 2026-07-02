import { test, expect } from '../fixtures/testBase';
import { createManufacturer } from '../helpers/manufacturerHelper';
import { createReport } from '../helpers/reportHelper';

test('happy path: create manufacturer, create report, upload valid file — status 50 shown in UI', async ({
  downloadsPage,
  api,
  getFixture,
}) => {
  // Arrange
  const { id: manufacturerId } = await createManufacturer(api, {
    name: 'FlowTest Corp',
    iconColor: '#00D4D4',
  });
  await createReport(api, { manufacturerId, branch: 'North', name: 'Q1 Report', category: 'life' });
  await downloadsPage.navigate();

  // Act
  await downloadsPage.setUploadFile(getFixture('valid-upload-e2e.xlsx'));
  await downloadsPage.clickUpload();

  // Assert
  await expect(downloadsPage.uploadResult).toContainText('50');
});

test('error path: upload invalid file — correct error status shown in UI', async ({
  downloadsPage,
  getFixture,
}) => {
  // Arrange
  await downloadsPage.navigate();

  // Act
  await downloadsPage.setUploadFile(getFixture('invalid-empty-e2e.xlsx'));
  await downloadsPage.clickUpload();

  // Assert
  await expect(downloadsPage.uploadResult).toContainText('61');
});

test('duplicate upload: upload same file twice — second upload rejected', async ({
  downloadsPage,
  getFixture,
}) => {
  // Arrange
  await downloadsPage.navigate();

  // Act — first upload
  await downloadsPage.setUploadFile(getFixture('valid-upload-dup.xlsx'));
  await downloadsPage.clickUpload();
  await expect(downloadsPage.uploadResult).toContainText('50');

  // Act — second upload of the identical file
  await downloadsPage.setUploadFile(getFixture('valid-upload-dup.xlsx'));
  await downloadsPage.clickUpload();

  // Assert — duplicate must not succeed
  await expect(downloadsPage.uploadResult).not.toContainText('50');
});
