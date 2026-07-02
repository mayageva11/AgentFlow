import { Router, Request, Response } from 'express';
import { getAgencyId } from '../utils/session';
import { getManufacturer } from './manufacturer';
import { reports } from '../state';

const router = Router();

function generateId(): string {
  return 'RPT-' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

router.post('/', (req: Request, res: Response) => {
  const agencyId = getAgencyId(req);
  if (!agencyId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { manufacturerId, branch, name, category } = req.body as {
    manufacturerId: string; branch: string; name: string; category: string;
  };
  if (!getManufacturer(manufacturerId, agencyId)) {
    res.status(403).json({ error: 'Forbidden: manufacturer not owned by this agency' });
    return;
  }
  const id = generateId();
  reports.set(id, { id, manufacturerId, branch, name, category, agencyId });
  res.json({ id });
});

export default router;
