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

  // all-or-nothing: a single bad row rejects the entire file
  expect(result.status).toBe(67);
});

test('file with invalid category value — returns status 67', async ({ page }) => {
  await page.route('**/api/upload', route =>
    route.fulfill({ json: mockData.upload.status67_invalidCategory })
  );

  const result = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });

  // category must be one of: life | health | pension | property
  expect(result.status).toBe(67);
});

test('duplicate file — second upload of identical content returns status 67', async ({
  page
}) => {
  // First upload succeeds (base fixture routes /api/upload → status 50)
  const first = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });
  expect(first.status).toBe(50);

  // Server detects the same SHA-256 hash and rejects the second attempt
  await page.route('**/api/upload', route =>
    route.fulfill({ json: mockData.upload.status67 })
  );

  const second = await page.evaluate(async () => {
    const res = await fetch('/api/upload', { method: 'POST' });
    return res.json();
  });
  expect(second.status).toBe(67);
});
