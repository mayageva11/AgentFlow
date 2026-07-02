import { test as base, expect } from '@playwright/test';
import mockData from '../mockData.json';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Custom test fixture.
 *
 * The `page` override intercepts every API call with controlled JSON from
 * mockData.json so tests never depend on real server state.
 * Individual tests can override a specific route to simulate error cases.
 */
export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
}>({
  page: async ({ page }, use) => {
    await page.route('**/api/dashboard', route =>
      route.fulfill({ json: mockData.dashboard.agencyA })
    );
    await page.route('**/api/manufacturer', route =>
      route.fulfill({ json: mockData.manufacturer.success })
    );
    await page.route('**/api/report', route =>
      route.fulfill({ json: mockData.report.success })
    );
    await page.route('**/api/upload', route =>
      route.fulfill({ json: mockData.upload.status50 })
    );

    // Navigate to the app so relative URLs work in page.evaluate() calls.
    // Routes registered above survive across navigations for the life of the page.
    await page.goto('/login');

    await use(page);
    // Playwright closes the context automatically after each test —
    // no manual cookie clearing needed.
  },

  loginPage:     async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
});

export { expect };
