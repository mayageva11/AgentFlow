import { APIRequestContext } from '@playwright/test';
import { ManufacturerData } from '../../src/server/types';

export async function createManufacturer(
  request: APIRequestContext,
  data: ManufacturerData
): Promise<{ id: string }> {
  const response = await request.post('/api/manufacturer', { data });
  return response.json();
}
