import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import crypto from 'crypto';
import { Row } from '../types';
import { isFileEmpty } from '../validators/fileValidator';
import { validateRow } from '../validators/rowValidator';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const uploadedHashes = new Set<string>();

const TEMPLATE_HEADERS = ['month', 'policy_id', 'category'];

function parseExcel(buffer: Buffer): Row[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Row>(sheet);
}

function hashBuffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function isDuplicate(buffer: Buffer): boolean {
  const hash = hashBuffer(buffer);
  if (uploadedHashes.has(hash)) return true;
  uploadedHashes.add(hash);
  return false;
}

function findFirstInvalidRow(rows: Row[]): { statusCode: number } | null {
  for (const row of rows) {
    const result = validateRow(row);
    if (!result.valid) return { statusCode: result.statusCode! };
  }
  return null;
}

function buildTemplateWorkbook(): XLSX.WorkBook {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  return wb;
}

router.get('/template', (_req: Request, res: Response) => {
  const wb = buildTemplateWorkbook();
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="upload-template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

router.post('/', upload.single('file'), (req: Request, res: Response) => {
  const buffer = req.file!.buffer;
  if (isDuplicate(buffer)) {
    res.json({ status: 67 });
    return;
  }
  const rows = parseExcel(buffer);
  if (isFileEmpty(rows)) {
    res.json({ status: 61 });
    return;
  }
  const error = findFirstInvalidRow(rows);
  if (error) {
    res.json({ status: error.statusCode });
    return;
  }
  res.json({ status: 50 });
});

export default router;
