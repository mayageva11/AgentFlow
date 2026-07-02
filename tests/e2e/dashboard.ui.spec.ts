import { test, expect } from '../fixtures/testBase';
import mockData from '../mockData.json';

test('mock success — dashboard table renders rows from intercepted API response', async ({
  dashboardPage
}) => {
  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  const expectedMfr = mockData.dashboard.agencyA[0].manufacturer;
  await expect(dashboardPage.getRowLocator(expectedMfr)).toBeVisible();
  await expect(dashboardPage.reportsTable).toBeVisible();
});

test('mock 500 — dashboard shows error message and hides table', async ({
  page,
  dashboardPage
}) => {
  await page.route('**/api/dashboard', route =>
    route.fulfill({ status: 500, json: { error: 'internal server error' } })
  );

  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  await expect(dashboardPage.dashboardError).toBeVisible();
  await expect(dashboardPage.reportsTable).not.toBeVisible();
});

test('data isolation — Agency B data does not leak into Agency A dashboard', async ({
  dashboardPage
}) => {
  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  await expect(
    dashboardPage.getRowLocator(mockData.dashboard.agencyA[0].manufacturer)
  ).toBeVisible();
  await expect(
    dashboardPage.getRowLocator(mockData.dashboard.agencyB[0].manufacturer)
  ).not.toBeVisible();
});
