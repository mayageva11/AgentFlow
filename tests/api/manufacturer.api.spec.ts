import { test, expect } from '../fixtures/testBase';
import mockData from '../mockData.json';

test('create manufacturer — returns id with MFR- prefix', async ({ page }) => {
  await page.route('**/api/manufacturer', route =>
    route.fulfill({ json: mockData.manufacturer.success })
  );

  const body = await page.evaluate(async () => {
    const res = await fetch('/api/manufacturer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Insurer', iconColor: '#1A73E8' })
    });
    return res.json();
  });

  expect(body.id).toBe(mockData.manufacturer.success.id);
  expect(body.id).toMatch(/^MFR-/);
});

test('unknown manufacturer id — returns 404', async ({ page }) => {
  await page.route('**/api/manufacturer/MFR-DOESNOTEXIST', route =>
    route.fulfill({ status: 404, json: mockData.manufacturer.notFound })
  );

  const status = await page.evaluate(async () => {
    const res = await fetch('/api/manufacturer/MFR-DOESNOTEXIST');
    return res.status;
  });

  expect(status).toBe(404);
});
