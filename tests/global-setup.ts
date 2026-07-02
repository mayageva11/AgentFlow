import { chromium, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/LoginPage';

const BASE_URL = 'http://127.0.0.1:4000';

function ensureAuthDir(): void {
  fs.mkdirSync(path.join(process.cwd(), '.auth'), { recursive: true });
}

async function loginAs(page: Page, email: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await page.goto(`${BASE_URL}/login`);
  await loginPage.fillEmail(email);
  await loginPage.fillPassword('Test1234!');
  await loginPage.clickSubmit();
}

async function waitForDashboard(page: Page): Promise<void> {
  await page.waitForURL('**/dashboard');
}

async function saveAuthState(page: Page, filename: string): Promise<void> {
  await page.context().storageState({ path: path.join(process.cwd(), '.auth', filename) });
}

export default async function globalSetup(): Promise<void> {
  ensureAuthDir();
  const browser = await chromium.launch();

  const pageA = await browser.newPage();
  await loginAs(pageA, 'agency-a@agentflow.dev');
  await waitForDashboard(pageA);
  await saveAuthState(pageA, 'agency-a.json');
  await pageA.close();

  const pageB = await browser.newPage();
  await loginAs(pageB, 'agency-b@agentflow.dev');
  await waitForDashboard(pageB);
  await saveAuthState(pageB, 'agency-b.json');
  await pageB.close();

  await browser.close();
}
