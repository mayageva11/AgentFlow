import { test, expect } from '@playwright/test';
import path from 'path';
import { ImportPage } from '../pages/ImportPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * True end-to-end flow through the real UI against the real server — no mocks.
 *
 * Covers the exact assignment scenario as a user would experience it:
 * create manufacturer → create report → upload filled template → check result,
 * then verify the commission data actually appears on the dashboard.
 */

const MFR_NAME = 'Shomera E2E Insurance';

test('full manual import flow — manufacturer, report, upload, dashboard result', async ({
  page,
}) => {
  const importPage = new ImportPage(page);
  const dashboardPage = new DashboardPage(page);

  // Step 1: create a custom manufacturer via the form
  await importPage.navigate();
  await importPage.createManufacturer(MFR_NAME, '#ff6600');
  await expect(importPage.mfrResult).toContainText('MFR-');

  // Step 2: create a report under it (branch, name, default category)
  await importPage.createReport('Elementary', 'Q1 Commission Report', 'pension');
  await expect(importPage.rptResult).toContainText('RPT-');

  // Step 3: upload the filled Excel template
  await importPage.uploadFile(path.join(process.cwd(), 'fixtures', 'valid-upload-e2e.xlsx'));
  await expect(importPage.uploadResult).toContainText('Status 50');

  // Step 4: the processed commission data shows up on the dashboard
  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();
  await expect(dashboardPage.getRowLocator(MFR_NAME).first()).toBeVisible();
});

test('uploading an empty template through the UI shows the status 61 error', async ({
  page,
}) => {
  const importPage = new ImportPage(page);

  await importPage.navigate();
  await importPage.uploadFile(path.join(process.cwd(), 'fixtures', 'invalid-empty-e2e.xlsx'));
  await expect(importPage.uploadResult).toContainText('Status 61');
});
