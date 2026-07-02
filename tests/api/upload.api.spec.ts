import { test, expect } from '../fixtures/testBase';
import mockData from '../mockData.json';

test('valid file — returns status 50', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });

  expect(result.status).toBe(50);
});

test('empty file (headers only) — returns status 61', async ({ page }) => {
  await page.route('**/api/upload', route =>
    route.fulfill({ json: mockData.upload.status61 })
  );

  const result = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });

  expect(result.status).toBe(61);
});

test('file with bad month format — returns status 70', async ({ page }) => {
  await page.route('**/api/upload', route =>
    route.fulfill({ json: mockData.upload.status70 })
  );

  const result = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });

  expect(result.status).toBe(70);
});

test('one bad row in otherwise valid file — entire file rejected with status 67', async ({
  page
}) => {
  await page.route('**/api/upload', route =>
    route.fulfill({ json: mockData.upload.status67 })
  );

  const result = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });

  expect(result.status).toBe(67);
});
