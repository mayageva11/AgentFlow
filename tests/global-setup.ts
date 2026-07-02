import { chromium, Page, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/LoginPage';

const BASE_URL = 'http://127.0.0.1:4000';

async function resetServer(): Promise<void> {
  const api = await request.newContext({ baseURL: BASE_URL });
  await api.post('/api/reset');
  await api.dispose();
}

function ensureAuthDir(): void {
  fs.mkdirSync(path.join(process.cwd(), '.auth'), { recursive: true });
}

async function loginAndSave(email: string, filename: string, browser: Awaited<ReturnType<typeof chromium.launch>>): Promise<void> {
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/login`);
  const loginPage = new LoginPage(page);
  await loginPage.fillEmail(email);
  await loginPage.fillPassword('Test1234!');
  await loginPage.clickSubmit();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: path.join(process.cwd(), '.auth', filename) });
  await page.close();
}

export default async function globalSetup(): Promise<void> {
  ensureAuthDir();

  // Clear all in-memory server state before each test run so the suite
  // is safe to run multiple times without leftover data.
  await resetServer();

  const browser = await chromium.launch();
  await loginAndSave('agency-a@agentflow.dev', 'agency-a.json', browser);
  await loginAndSave('agency-b@agentflow.dev', 'agency-b.json', browser);
  await browser.close();
}
