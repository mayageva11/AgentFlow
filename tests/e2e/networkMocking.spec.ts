import { test, expect } from '../fixtures/testBase';

const MOCK_REPORT = {
  manufacturer: 'MOCK_TEST_ROW',
  month: '06-2024',
  totalCommission: 9999,
  policyCount: 42,
  status: 'processed',
};

test('page.route() mocks success — custom JSON renders in table without hitting backend', async ({
  page,
  dashboardPage,
}) => {
  // Arrange — intercept before navigation so the very first fetch is already stubbed
  await page.route('**/api/dashboard', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([MOCK_REPORT]),
    }),
  );

  // Act
  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  // Assert — the mocked manufacturer name appears in the rendered table
  await expect(page.locator('text=MOCK_TEST_ROW')).toBeVisible();
  await expect(dashboardPage.reportsTable).toBeVisible();
  await expect(dashboardPage.dashboardError).not.toBeVisible();
});

test('page.route() mocks 500 — UI shows error message instead of crashing', async ({
  page,
  dashboardPage,
}) => {
  // Arrange — simulate an internal server error on the dashboard endpoint
  await page.route('**/api/dashboard', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'internal server error' }),
    }),
  );

  // Act
  await dashboardPage.navigate();
  await dashboardPage.waitForLoad();

  // Assert — graceful degradation: error message shown, table stays hidden
  await expect(dashboardPage.dashboardError).toBeVisible();
  await expect(dashboardPage.reportsTable).not.toBeVisible();
});
