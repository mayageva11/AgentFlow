import { test, expect, request as playwrightRequest } from '@playwright/test';
import path from 'path';
import { uploadFile } from '../helpers/uploadHelper';
import { createManufacturer } from '../helpers/manufacturerHelper';

const FIXTURES = path.join(process.cwd(), 'fixtures');
const fix = (name: string) => path.join(FIXTURES, name);

test('valid file returns status 50', async ({ request }) => {
  // Arrange
  const filePath = fix('valid-upload.xlsx');

  // Act
  const result = await uploadFile(request, filePath);

  // Assert
  expect(result.status).toBe(50);
});

test('empty file returns status 61', async ({ request }) => {
  // Arrange
  const filePath = fix('invalid-empty.xlsx');

  // Act
  const result = await uploadFile(request, filePath);

  // Assert
  expect(result.status).toBe(61);
});

test('file with missing fields returns status 67', async ({ request }) => {
  // Arrange
  const filePath = fix('invalid-missing-fields.xlsx');

  // Act
  const result = await uploadFile(request, filePath);

  // Assert
  expect(result.status).toBe(67);
});

test('file with bad month format returns status 70', async ({ request }) => {
  // Arrange
  const filePath = fix('invalid-bad-month.xlsx');

  // Act
  const result = await uploadFile(request, filePath);

  // Assert
  expect(result.status).toBe(70);
});

test('one bad row in otherwise valid file rejects entire file', async ({ request }) => {
  // Arrange
  const filePath = fix('invalid-mixed.xlsx');

  // Act
  const result = await uploadFile(request, filePath);

  // Assert
  expect(result.status).toBe(67);
});

test('file with wrong category returns status 67', async ({ request }) => {
  // Arrange
  const filePath = fix('invalid-wrong-category.xlsx');

  // Act
  const result = await uploadFile(request, filePath);

  // Assert
  expect(result.status).toBe(67);
});

test('manufacturer from agency A is not accessible by agency B', async ({ request }) => {
  // Arrange — create manufacturer under agency-a (current session)
  const { id } = await createManufacturer(request, { name: 'Agency A Corp', iconColor: '#FF0000' });

  // Act — attempt read with an agency-b session context
  const agencyBCtx = await playwrightRequest.newContext({
    baseURL: 'http://127.0.0.1:4000',
    storageState: '.auth/agency-b.json',
  });
  const response = await agencyBCtx.get(`/api/manufacturer/${id}`);
  await agencyBCtx.dispose();

  // Assert
  expect(response.status()).toBe(404);
});
