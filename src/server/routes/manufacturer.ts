import { Router, Request, Response } from 'express';
import { ManufacturerData } from '../types';
import { getAgencyId } from '../utils/session';

const router = Router();

type Manufacturer = ManufacturerData & { id: string; agencyId: string };
const manufacturers = new Map<string, Manufacturer>();

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function saveManufacturer(data: ManufacturerData, agencyId: string): string {
  const id = generateId();
  manufacturers.set(id, { ...data, id, agencyId });
  return id;
}

export function getManufacturer(id: string, agencyId: string): Manufacturer | null {
  const m = manufacturers.get(id);
  return m?.agencyId === agencyId ? m : null;
}

router.post('/', (req: Request, res: Response) => {
  const agencyId = getAgencyId(req);
  if (!agencyId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const { name, iconColor } = req.body;
  const id = saveManufacturer({ name, iconColor }, agencyId);
  res.json({ id });
});

router.get('/:id', (req: Request, res: Response) => {
  const agencyId = getAgencyId(req);
  if (!agencyId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const manufacturer = getManufacturer(req.params.id, agencyId);
  if (!manufacturer) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(manufacturer);
});

export default router;
