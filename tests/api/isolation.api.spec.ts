import { test, expect, request as playwrightRequest } from '@playwright/test';
import { createManufacturer } from '../helpers/manufacturerHelper';

async function agencyAContext() {
  return playwrightRequest.newContext({
    baseURL: 'http://127.0.0.1:4000',
    storageState: '.auth/agency-a.json',
  });
}

/**
 * All tests in this file run under the "Data Isolation Security" Playwright project,
 * which injects agency-B credentials via storageState.
 * Agency-A contexts are created explicitly per-test.
 */

test('agency B cannot read a manufacturer created by agency A', async ({ request }) => {
  const ctxA = await agencyAContext();
  const { id } = await createManufacturer(ctxA, { name: 'AgencyA Private Corp', iconColor: '#FF0000' });
  await ctxA.dispose();

  const res = await request.get(`/api/manufacturer/${id}`);
  expect(res.status()).toBe(404);
});

test('agency B cannot create a report that references an agency A manufacturer', async ({ request }) => {
  const ctxA = await agencyAContext();
  const { id: manufacturerId } = await createManufacturer(ctxA, { name: 'AgencyA Mfr', iconColor: '#00AA00' });
  await ctxA.dispose();

  const res = await request.post('/api/report', {
    data: { manufacturerId, branch: 'Elementary', name: 'Cross-tenant Report', category: 'health' },
  });

  expect(res.status()).toBe(403);
});

test('agency B manufacturer is invisible to agency A', async ({ request }) => {
  // request = agency B (injected by Data Isolation Security project)
  const { id } = await createManufacturer(request, { name: 'AgencyB Corp', iconColor: '#0000FF' });

  const ctxA = await agencyAContext();
  const res = await ctxA.get(`/api/manufacturer/${id}`);
  await ctxA.dispose();

  expect(res.status()).toBe(404);
});
