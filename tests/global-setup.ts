import { chromium, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function ensureAuthDir(): void {
  fs.mkdirSync(path.join(process.cwd(), '.auth'), { recursive: true });
}

async function loginAs(page: Page, email: string): Promise<void> {
  await page.goto('http://127.0.0.1:4000/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'Test1234!');
  await page.click('[type="submit"]');
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
