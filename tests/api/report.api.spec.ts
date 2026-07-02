import { test, expect } from '../fixtures/testBase';
import mockData from '../mockData.json';

test('create report — returns id with RPT- prefix', async ({ page }) => {
  const body = await page.evaluate(async () => {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manufacturerId: 'MFR-999AA',
        branch: 'Life & Finance',
        name: 'Audit Q1',
        category: 'life'
      })
    });
    return res.json();
  });

  expect(body.id).toMatch(/^RPT-/);
});

test('create report for foreign manufacturer — returns 403', async ({
  page
}) => {
  await page.route('**/api/report', route =>
    route.fulfill({ status: 403, json: mockData.report.forbidden })
  );

  const status = await page.evaluate(async () => {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manufacturerId: 'MFR-DOESNOTEXIST',
        branch: 'Elementary',
        name: 'Invalid',
        category: 'health'
      })
    });
    return res.status;
  });

  expect(status).toBe(403);
});
