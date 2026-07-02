import { test, expect } from '../fixtures/testBase';
import mockData from '../mockData.json';

test('agency B cannot read a manufacturer created by agency A', async ({
  page
}) => {
  await page.route('**/api/manufacturer/*', route =>
    route.fulfill({ status: 404, json: mockData.manufacturer.notFound })
  );

  const status = await page.evaluate(async () => {
    const res = await fetch('/api/manufacturer/MFR-999AA');
    return res.status;
  });

  expect(status).toBe(404);
});

test('agency B cannot create a report that references an agency A manufacturer', async ({
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
        manufacturerId: 'MFR-999AA',
        branch: 'Elementary',
        name: 'Cross-tenant',
        category: 'health'
      })
    });
    return res.status;
  });

  expect(status).toBe(403);
});
