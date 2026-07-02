import { test, expect } from '@playwright/test';
import { createManufacturer } from '../helpers/manufacturerHelper';

test('create manufacturer — returns id with MFR- prefix', async ({ request }) => {
  const res = await request.post('/api/manufacturer', {
    data: { name: 'Test Insurer', iconColor: '#1A73E8' },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('id');
  expect(body.id).toMatch(/^MFR-/);
});

test('retrieve manufacturer — returns correct name and iconColor', async ({ request }) => {
  const { id } = await createManufacturer(request, { name: 'מנורה מבטחים', iconColor: '#FF5733' });

  const res = await request.get(`/api/manufacturer/${id}`);

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.id).toBe(id);
  expect(body.name).toBe('מנורה מבטחים');
  expect(body.iconColor).toBe('#FF5733');
});

test('unknown manufacturer id — returns 404', async ({ request }) => {
  const res = await request.get('/api/manufacturer/MFR-DOESNOTEXIST');
  expect(res.status()).toBe(404);
});
