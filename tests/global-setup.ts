import { chromium, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function login(page: Page): Promise<void> {
  await page.goto('http://127.0.0.1:4000/login');
  await page.fill('[name="email"]', 'test@agentflow.dev');
  await page.fill('[name="password"]', 'Test1234!');
  await page.click('[type="submit"]');
}

async function waitForDashboard(page: Page): Promise<void> {
  await page.waitForURL('**/dashboard');
}

async function saveAuthState(page: Page, filePath: string): Promise<void> {
  await page.context().storageState({ path: filePath });
}

export default async function globalSetup(): Promise<void> {
  const authPath = path.join(process.cwd(), '.auth', 'user.json');
  fs.mkdirSync(path.dirname(authPath), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await login(page);
  await waitForDashboard(page);
  await saveAuthState(page, authPath);
  await browser.close();
}
