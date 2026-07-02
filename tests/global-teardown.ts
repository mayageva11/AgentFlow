import { request } from '@playwright/test';

export default async function globalTeardown(): Promise<void> {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:4000' });
  await api.post('/api/reset');
  await api.dispose();
}
