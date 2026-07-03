import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import path from 'path';
import { uploadFile } from '../helpers/uploadHelper';

/**
 * Integration tests — real HTTP requests against the running Express server.
 *
 * Unlike the mock-driven suites, nothing is intercepted here: the actual XLSX
 * fixtures from /fixtures are uploaded and the server's real validators,
 * status codes, and SHA-256 duplicate detection are exercised.
 * globalSetup resets server state via POST /api/reset, so runs are repeatable.
 */

const FIXTURES = path.join(process.cwd(), 'fixtures');

test('valid file — server returns status 50', async ({ request }) => {
  const result = await uploadFile(request, path.join(FIXTURES, 'valid-upload.xlsx'));
  expect(result.status).toBe(50);
});

test('empty file (headers only) — server returns status 61', async ({ request }) => {
  const result = await uploadFile(request, path.join(FIXTURES, 'invalid-empty.xlsx'));
  expect(result.status).toBe(61);
});

test('missing required field — server returns status 67', async ({ request }) => {
  const result = await uploadFile(request, path.join(FIXTURES, 'invalid-missing-fields.xlsx'));
  expect(result.status).toBe(67);
});

test('one bad row among valid rows — server rejects entire file with status 67', async ({
  request,
}) => {
  const result = await uploadFile(request, path.join(FIXTURES, 'invalid-mixed.xlsx'));
  // all-or-nothing: rows 1-2 are valid but row 3 is missing policy_id
  expect(result.status).toBe(67);
});

test('invalid category value — server returns status 67', async ({ request }) => {
  const result = await uploadFile(request, path.join(FIXTURES, 'invalid-wrong-category.xlsx'));
  // category must be one of: life | health | pension | property
  expect(result.status).toBe(67);
});

test('bad month format — server returns status 70', async ({ request }) => {
  const result = await uploadFile(request, path.join(FIXTURES, 'invalid-bad-month.xlsx'));
  // fixture uses 2024/01 instead of MM-YYYY
  expect(result.status).toBe(70);
});

test('duplicate file — first upload succeeds, byte-identical re-upload rejected', async ({
  request,
}) => {
  const dupFile = path.join(FIXTURES, 'valid-upload-dup.xlsx');

  const first = await uploadFile(request, dupFile);
  expect(first.status).toBe(50);

  // Server keeps a SHA-256 hash of every processed file
  const second = await uploadFile(request, dupFile);
  expect(second.status).toBe(67);
});

test('template download — XLSX contains exactly the three required headers', async ({
  request,
}) => {
  const response = await request.get('/api/upload/template');
  expect(response.ok()).toBe(true);

  const workbook = XLSX.read(await response.body(), { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const headers = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })[0];
  expect(headers).toEqual(['month', 'policy_id', 'category']);
});
