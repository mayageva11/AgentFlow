import * as XLSX from 'xlsx';
import { test, expect } from '@playwright/test';
import { createManufacturer } from '../helpers/manufacturerHelper';
import { createReport } from '../helpers/reportHelper';

test('create report — returns id with RPT- prefix', async ({ request }) => {
  const { id: manufacturerId } = await createManufacturer(request, {
    name: 'Report Test Corp',
    iconColor: '#00AA88',
  });

  const res = await request.post('/api/report', {
    data: { manufacturerId, branch: 'Life & Finance', name: 'Audit Q1', category: 'life' },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('id');
  expect(body.id).toMatch(/^RPT-/);
});

test('create report for foreign manufacturer — returns 403', async ({ request }) => {
  const res = await request.post('/api/report', {
    data: {
      manufacturerId: 'MFR-DOESNOTEXIST',
      branch: 'Elementary',
      name: 'Invalid',
      category: 'health',
    },
  });

  expect(res.status()).toBe(403);
});

test('download template — XLSX file contains required column headers', async ({ request }) => {
  const res = await request.get('/api/upload/template');

  expect(res.status()).toBe(200);
  const buffer = await res.body();
  const wb = XLSX.read(buffer);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const [headers] = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });

  expect(headers).toContain('month');
  expect(headers).toContain('policy_id');
  expect(headers).toContain('category');
});
