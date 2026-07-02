import * as XLSX from 'xlsx';
import { test, expect } from '../fixtures/testBase';
import { createManufacturer } from '../helpers/manufacturerHelper';

test('create report under manufacturer — correct branch and category saved', async ({ downloadsPage, api }) => {
  // Arrange
  const { id: manufacturerId } = await createManufacturer(api, {
    name: 'Report Test Corp',
    iconColor: '#00AA88',
  });
  await downloadsPage.navigate();

  // Act
  await downloadsPage.createReport(manufacturerId, 'South', 'Audit Q2', 'health');

  // Assert
  await downloadsPage.assertReportCreated();
});

test('download Excel template — file downloaded with correct headers', async ({ downloadsPage }) => {
  // Arrange
  await downloadsPage.navigate();

  // Act
  const download = await downloadsPage.downloadTemplate();
  const filePath = await download.path();

  // Assert
  const wb = XLSX.readFile(filePath!);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const [headers] = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
  expect(headers).toContain('month');
  expect(headers).toContain('policy_id');
  expect(headers).toContain('category');
});
