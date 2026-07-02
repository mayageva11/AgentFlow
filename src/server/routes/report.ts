import { Router, Request, Response } from 'express';
import { ReportData } from '../types';
import { getAgencyId } from '../utils/session';
import { getManufacturer } from './manufacturer';

const router = Router();

type Report = ReportData & { id: string; agencyId: string };
const reports = new Map<string, Report>();

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function saveReport(data: ReportData, agencyId: string): string {
  const id = generateId();
  reports.set(id, { ...data, id, agencyId });
  return id;
}

router.post('/', (req: Request, res: Response) => {
  const agencyId = getAgencyId(req);
  if (!agencyId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { manufacturerId, branch, name, category } = req.body;
  if (!getManufacturer(manufacturerId, agencyId)) {
    res.status(403).json({ error: 'Forbidden: manufacturer not owned by this agency' });
    return;
  }
  const id = saveReport({ manufacturerId, branch, name, category }, agencyId);
  res.json({ id });
});

export default router;
