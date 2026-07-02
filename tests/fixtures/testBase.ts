import { test as base, expect, APIRequestContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  api: APIRequestContext;
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

  api: async ({ request }, use) => {
    await use(request);
  },

  getFixture: async ({}, use) => {
    await use((name: string) => path.join(FIXTURES_DIR, name));
  },
});

export { expect };
