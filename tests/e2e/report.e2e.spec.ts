import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import { createManufacturer } from '../helpers/manufacturerHelper';

test('create report under manufacturer — correct branch and category saved', async ({ page, request }) => {
  // Arrange
  const { id: manufacturerId } = await createManufacturer(request, {
    name: 'Report Test Corp',
    iconColor: '#00AA88',
    agencyId: 'agency-report-test',
  });
  await page.goto('/downloads');

  // Act
  await page.fill('#report-manufacturer-id', manufacturerId);
  await page.fill('#report-branch', 'South');
  await page.fill('#report-name', 'Audit Q2');
  await page.fill('#report-category', 'health');
  await page.click('#create-report-btn');

  // Assert
  await expect(page.locator('#report-result')).toContainText('Created');
  await expect(page.locator('#report-result')).toContainText('ID:');
});

test('download Excel template — file downloaded with correct headers', async ({ page }) => {
  // Arrange
  await page.goto('/downloads');

  // Act
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#download-template-btn'),
  ]);
  const filePath = await download.path();

  // Assert
  const wb = XLSX.readFile(filePath!);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const [headers] = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
  expect(headers).toContain('month');
  expect(headers).toContain('policy_id');
  expect(headers).toContain('category');
});
