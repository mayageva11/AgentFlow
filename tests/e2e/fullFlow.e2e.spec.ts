import { test, expect } from '@playwright/test';
import path from 'path';
import { createManufacturer } from '../helpers/manufacturerHelper';
import { createReport } from '../helpers/reportHelper';

const FIXTURES = path.join(process.cwd(), 'fixtures');
const fix = (name: string) => path.join(FIXTURES, name);

test('happy path: create manufacturer, create report, upload valid file — status 50 shown in UI', async ({ page, request }) => {
  // Arrange
  const { id: manufacturerId } = await createManufacturer(request, {
    name: 'FlowTest Corp',
    iconColor: '#00D4D4',
    agencyId: 'agency-flow',
  });
  await createReport(request, {
    manufacturerId,
    branch: 'North',
    name: 'Q1 Report',
    category: 'life',
  });
  await page.goto('/downloads');

  // Act
  await page.setInputFiles('#upload-file', fix('valid-upload-e2e.xlsx'));
  await page.click('#upload-btn');

  // Assert
  await expect(page.locator('#upload-result')).toContainText('50');
});

test('error path: upload invalid file — correct error status shown in UI', async ({ page }) => {
  // Arrange
  await page.goto('/downloads');

  // Act
  await page.setInputFiles('#upload-file', fix('invalid-empty-e2e.xlsx'));
  await page.click('#upload-btn');

  // Assert
  await expect(page.locator('#upload-result')).toContainText('61');
});

test('duplicate upload: upload same file twice — second upload rejected', async ({ page }) => {
  // Arrange
  await page.goto('/downloads');

  // Act — first upload
  await page.setInputFiles('#upload-file', fix('valid-upload-dup.xlsx'));
  await page.click('#upload-btn');
  await expect(page.locator('#upload-result')).toContainText('50');

  // Act — second upload of same file
  await page.setInputFiles('#upload-file', fix('valid-upload-dup.xlsx'));
  await page.click('#upload-btn');

  // Assert
  await expect(page.locator('#upload-result')).not.toContainText('50');
});
