import { APIRequestContext } from '@playwright/test';
import { ReportData } from '../../src/server/types';

export async function createReport(
  request: APIRequestContext,
  data: ReportData
): Promise<{ id: string }> {
  const response = await request.post('/api/report', { data });
  return response.json();
}
