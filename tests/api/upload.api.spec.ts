import { test, expect } from '@playwright/test';
import path from 'path';
import { uploadFile } from '../helpers/uploadHelper';

const FIXTURES = path.join(process.cwd(), 'fixtures');
const fix = (name: string) => path.join(FIXTURES, name);

test('valid file — returns status 50', async ({ request }) => {
  const result = await uploadFile(request, fix('valid-upload.xlsx'));
  expect(result.status).toBe(50);
});

test('empty file (headers only) — returns status 61', async ({ request }) => {
  const result = await uploadFile(request, fix('invalid-empty.xlsx'));
  expect(result.status).toBe(61);
});

test('file with missing required fields — returns status 67', async ({ request }) => {
  const result = await uploadFile(request, fix('invalid-missing-fields.xlsx'));
  expect(result.status).toBe(67);
});

test('file with bad month format — returns status 70', async ({ request }) => {
  const result = await uploadFile(request, fix('invalid-bad-month.xlsx'));
  expect(result.status).toBe(70);
});

test('one bad row in otherwise valid file — entire file rejected with status 67', async ({ request }) => {
  const result = await uploadFile(request, fix('invalid-mixed.xlsx'));
  expect(result.status).toBe(67);
});

test('file with invalid category — returns status 67', async ({ request }) => {
  const result = await uploadFile(request, fix('invalid-wrong-category.xlsx'));
  expect(result.status).toBe(67);
});

test('duplicate upload — byte-identical file on second attempt is rejected', async ({ request }) => {
  const filePath = fix('valid-upload-dup.xlsx');

  const first = await uploadFile(request, filePath);
  expect(first.status).toBe(50);

  const second = await uploadFile(request, filePath);
  expect(second.status).not.toBe(50);
});
