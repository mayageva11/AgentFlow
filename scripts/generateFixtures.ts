import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const FIXTURES_DIR = path.join(process.cwd(), 'fixtures');

function writeXlsx(filename: string, rows: object[]): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, path.join(FIXTURES_DIR, filename));
  console.log(`Created: ${filename}`);
}

function writeEmptyXlsx(filename: string): void {
  const ws = XLSX.utils.aoa_to_sheet([['month', 'policy_id', 'category']]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, path.join(FIXTURES_DIR, filename));
  console.log(`Created: ${filename}`);
}

function generateFixtures(): void {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });

  writeXlsx('valid-upload.xlsx', [
    { month: '01-2024', policy_id: 'POL-001', category: 'life' },
    { month: '02-2024', policy_id: 'POL-002', category: 'health' },
  ]);

  writeXlsx('valid-upload-e2e.xlsx', [
    { month: '03-2024', policy_id: 'POL-E2E-001', category: 'pension' },
    { month: '04-2024', policy_id: 'POL-E2E-002', category: 'property' },
  ]);

  writeXlsx('valid-upload-dup.xlsx', [
    { month: '05-2024', policy_id: 'POL-DUP-001', category: 'life' },
    { month: '06-2024', policy_id: 'POL-DUP-002', category: 'health' },
  ]);

  writeEmptyXlsx('invalid-empty.xlsx');

  writeXlsx('invalid-bad-month.xlsx', [
    { month: '2024/01', policy_id: 'POL-BAD-001', category: 'life' },
  ]);

  writeXlsx('invalid-missing-fields.xlsx', [
    { month: '01-2024', category: 'life' },
  ]);

  writeXlsx('invalid-mixed.xlsx', [
    { month: '01-2024', policy_id: 'POL-MIXED-001', category: 'life' },
    { month: '02-2024', policy_id: 'POL-MIXED-002', category: 'health' },
    { month: '03-2024', category: 'life' },
  ]);

  writeXlsx('invalid-wrong-category.xlsx', [
    { month: '01-2024', policy_id: 'POL-CAT-001', category: 'invalid-category' },
  ]);

  const wsE2eEmpty = XLSX.utils.aoa_to_sheet([['month', 'policy_id', 'category', 'notes']]);
  const wbE2eEmpty = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbE2eEmpty, wsE2eEmpty, 'Sheet1');
  XLSX.writeFile(wbE2eEmpty, path.join(FIXTURES_DIR, 'invalid-empty-e2e.xlsx'));
  console.log('Created: invalid-empty-e2e.xlsx');
}

generateFixtures();
