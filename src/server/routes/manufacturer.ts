import { Router, Request, Response } from 'express';
import { getAgencyId } from '../utils/session';
import { manufacturers, StoredManufacturer } from '../state';

const router = Router();

function generateId(): string {
  return 'MFR-' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function getManufacturer(id: string, agencyId: string): StoredManufacturer | null {
  const m = manufacturers.get(id);
  return m?.agencyId === agencyId ? m : null;
}

router.post('/', (req: Request, res: Response) => {
  const agencyId = getAgencyId(req);
  if (!agencyId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { name, iconColor } = req.body as { name: string; iconColor: string };
  const id = generateId();
  manufacturers.set(id, { id, name, iconColor, agencyId });
  res.json({ id });
});

router.get('/:id', (req: Request, res: Response) => {
  const agencyId = getAgencyId(req);
  if (!agencyId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const m = getManufacturer(req.params.id, agencyId);
  if (!m) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(m);
});

export default router;
