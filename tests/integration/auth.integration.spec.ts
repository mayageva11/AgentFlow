import { test, expect } from '@playwright/test';

/**
 * Integration test — real login endpoint, no mocks.
 */

test('login with wrong password — 401 and no session cookie', async ({ playwright }) => {
  // Fresh context without storageState so no pre-existing cookies interfere
  const api = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:4000' });

  const response = await api.post('/api/login', {
    data: { email: 'agency-a@agentflow.dev', password: 'WrongPassword!' },
  });

  expect(response.status()).toBe(401);
  expect(response.headers()['set-cookie']).toBeUndefined();

  await api.dispose();
});
