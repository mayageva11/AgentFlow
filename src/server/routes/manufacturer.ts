import { Router, Request, Response } from 'express';
import { ManufacturerData } from '../types';

const router = Router();

type Manufacturer = ManufacturerData & { id: string };
const manufacturers = new Map<string, Manufacturer>();

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function saveManufacturer(data: ManufacturerData): string {
  const id = generateId();
  manufacturers.set(id, { ...data, id });
  return id;
}

export function getManufacturer(id: string, agencyId: string): Manufacturer | null {
  const m = manufacturers.get(id);
  return m?.agencyId === agencyId ? m : null;
}

router.post('/', (req: Request, res: Response) => {
  const { name, iconColor, agencyId } = req.body;
  const id = saveManufacturer({ name, iconColor, agencyId });
  res.json({ id });
});

router.get('/:id', (req: Request, res: Response) => {
  const { agencyId } = req.query;
  const manufacturer = getManufacturer(req.params.id, agencyId as string);
  if (!manufacturer) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(manufacturer);
});

export default router;
