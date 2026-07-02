import { Router, Request, Response } from 'express';
import { ReportData } from '../types';

const router = Router();

type Report = ReportData & { id: string };
const reports = new Map<string, Report>();

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function saveReport(data: ReportData): string {
  const id = generateId();
  reports.set(id, { ...data, id });
  return id;
}

router.post('/', (req: Request, res: Response) => {
  const { manufacturerId, branch, name, category } = req.body;
  const id = saveReport({ manufacturerId, branch, name, category });
  res.json({ id });
});

export default router;
