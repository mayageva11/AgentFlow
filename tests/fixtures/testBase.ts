import { test as base, expect, APIRequestContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DownloadsPage } from '../pages/DownloadsPage';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  downloadsPage: DownloadsPage;
  /** Alias for the built-in `request` context — use for API setup in E2E tests. */
  api: APIRequestContext;
  /** Returns an absolute path to a named fixture file under the `fixtures/` directory. */
  getFixture: (name: string) => string;
};

const FIXTURES_DIR = path.join(process.cwd(), 'fixtures');

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  downloadsPage: async ({ page }, use) => {
    await use(new DownloadsPage(page));
  },

  api: async ({ request }, use) => {
    await use(request);
  },

  getFixture: async ({}, use) => {
    await use((name: string) => path.join(FIXTURES_DIR, name));
  },
});

export { expect };
