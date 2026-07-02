import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['allure-playwright'], ['github']]
    : [['html', { open: 'always' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4000',
    storageState: '.auth/user.json',
    trace: 'on-first-retry',
  },
});
