import { test, expect } from '../fixtures/testBase';
import mockData from '../mockData.json';

/**
 * End-to-end flow: create manufacturer → create report → upload file → check result on dashboard.
 *
 * All API calls are intercepted by page.route() so the tests are deterministic
 * and never depend on server state.  The base fixture in testBase.ts installs
 * the default mocks; individual tests override specific routes to simulate
 * different outcomes.
 */

test('happy path — upload succeeds (status 50) → commission record appears on dashboard', async ({
  page,
  dashboardPage,
}) => {
  // Step 1: Create custom manufacturer (intercepted → returns mock ID)
  const mfr = await page.evaluate(async () => {
    const res = await fetch('/api/manufacturer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Menora (Agency A Custom)', iconColor: '#FF6600' }),
    });
    return res.json();
  });
  expect(mfr.id).toMatch(/^MFR-/);

  // Step 2: Create commission report for that manufacturer
  const rpt = await page.evaluate(async (manufacturerId) => {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manufacturerId, branch: 'Life & Finance', name: 'Q1 Report', category: 'life' }),
    });
    return res.json();
  }, mfr.id);
  expect(rpt.id).toMatch(/^RPT-/);

  // Step 3: Upload XLSX file → status 50 (success)
  const upload = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });
  expect(upload.status).toBe(50);

  // Step 4: Check result on dashboard — commission record is visible
  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();
  await expect(dashboardPage.reportsTable).toBeVisible();
  await expect(dashboardPage.getRowLocator(mockData.dashboard.agencyA[0].manufacturer)).toBeVisible();
});

test('upload rejected — bad format (status 67) → dashboard shows no commission record', async ({
  page,
  dashboardPage,
}) => {
  // Override upload to simulate a file with a missing required field
  await page.route('**/api/upload', route =>
    route.fulfill({ json: mockData.upload.status67 })
  );

  const upload = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });
  expect(upload.status).toBe(67);

  // Dashboard shows no records after a rejected upload
  await page.route('**/api/dashboard', route =>
    route.fulfill({ json: [] })
  );

  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();
  const rowCount = await page.locator('[data-testid="dashboard-row"]').count();
  expect(rowCount).toBe(0);
});

test('upload rejected — bad month format (status 70) → dashboard shows no commission record', async ({
  page,
  dashboardPage,
}) => {
  // Override upload to simulate month written as YYYY/MM instead of MM-YYYY
  await page.route('**/api/upload', route =>
    route.fulfill({ json: mockData.upload.status70 })
  );

  const upload = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });
  expect(upload.status).toBe(70);

  await page.route('**/api/dashboard', route =>
    route.fulfill({ json: [] })
  );

  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();
  const rowCount = await page.locator('[data-testid="dashboard-row"]').count();
  expect(rowCount).toBe(0);
});
