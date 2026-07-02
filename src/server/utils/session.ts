import { Request } from 'express';

export function getAgencyId(req: Request): string | null {
  const raw = req.headers.cookie
    ?.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('session='));
  if (!raw) return null;
  try {
    const value = decodeURIComponent(raw.slice('session='.length));
    const parsed = JSON.parse(value) as { agencyId?: string };
    return parsed.agencyId ?? null;
  } catch {
    return null;
  }
}
