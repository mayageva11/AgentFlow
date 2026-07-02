import { test, expect } from '../fixtures/testBase';

const MOCK_REPORT = {
  manufacturer: 'MOCK_INSURER_ROW',
  month: '06-2024',
  category: 'life',
  totalCommission: 9999,
  policyCount: 42,
  status: 'processed',
};

test('mock success — dashboard table renders rows from intercepted API response', async ({
  page,
  dashboardPage,
}) => {
  await page.route('**/api/dashboard', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([MOCK_REPORT]),
    }),
  );

  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  await expect(dashboardPage.getRowLocator(MOCK_REPORT.manufacturer)).toBeVisible();
  await expect(dashboardPage.reportsTable).toBeVisible();
  await expect(dashboardPage.dashboardError).not.toBeVisible();
});

test('mock 500 — dashboard shows error message and hides table', async ({
  page,
  dashboardPage,
}) => {
  await page.route('**/api/dashboard', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'internal server error' }),
    }),
  );

  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  await expect(dashboardPage.dashboardError).toBeVisible();
  await expect(dashboardPage.reportsTable).not.toBeVisible();
});
