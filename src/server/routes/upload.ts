import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import crypto from 'crypto';
import { Row } from '../types';
import { isFileEmpty } from '../validators/fileValidator';
import { validateRow } from '../validators/rowValidator';
import { uploadHistory } from '../state';
import { getAgencyId } from '../utils/session';

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

function recordUpload(filename: string, status: number, rowCount: number, agencyId: string): void {
  uploadHistory.unshift({
    id:       crypto.randomUUID(),
    filename,
    status,
    rowCount,
    ts:       new Date().toISOString(),
    agencyId,
  });
  if (uploadHistory.length > 50) uploadHistory.pop();
}

router.get('/template', (_req: Request, res: Response) => {
  const wb = buildTemplateWorkbook();
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="upload-template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

router.post('/', upload.single('file'), (req: Request, res: Response) => {
  const agencyId = getAgencyId(req) ?? 'unknown';
  const buffer   = req.file!.buffer;
  const filename = req.file!.originalname;

  if (isDuplicate(buffer)) {
    recordUpload(filename, 67, 0, agencyId);
    res.json({ status: 67 });
    return;
  }

  const rows = parseExcel(buffer);

  if (isFileEmpty(rows)) {
    recordUpload(filename, 61, 0, agencyId);
    res.json({ status: 61 });
    return;
  }

  const error = findFirstInvalidRow(rows);
  if (error) {
    recordUpload(filename, error.statusCode, rows.length, agencyId);
    res.json({ status: error.statusCode });
    return;
  }

  recordUpload(filename, 50, rows.length, agencyId);
  res.json({ status: 50 });
});

export default router;
