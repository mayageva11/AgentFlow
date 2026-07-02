import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['allure-playwright'], ['github']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run server',
    url: 'http://127.0.0.1:4000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/agency-a.json',
      },
      testIgnore: '**/api/isolation.api.spec.ts',
    },
    {
      name: 'Mobile Safari',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        storageState: '.auth/agency-a.json',
      },
      testMatch: '**/e2e/responsive.spec.ts',
    },
    {
      name: 'Tablet Chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 834, height: 1194 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        storageState: '.auth/agency-a.json',
      },
      testMatch: '**/e2e/responsive.spec.ts',
    },
    {
      name: 'Data Isolation Security',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/agency-b.json',
      },
      testMatch: '**/api/isolation.api.spec.ts',
    },
  ],
});
