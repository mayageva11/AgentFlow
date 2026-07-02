import { test, expect, request as playwrightRequest } from '@playwright/test';
import { createManufacturer } from '../helpers/manufacturerHelper';

async function makeAgencyAContext() {
  return playwrightRequest.newContext({
    baseURL: 'http://127.0.0.1:4000',
    storageState: '.auth/agency-a.json',
  });
}

test('agency B cannot read a manufacturer created by agency A', async ({ request }) => {
  // Arrange — create resource under agency-a
  const agencyACtx = await makeAgencyAContext();
  const { id } = await createManufacturer(agencyACtx, { name: 'AgencyA Secret Corp', iconColor: '#FF0000' });
  await agencyACtx.dispose();

  // Act — agency-b session (injected by project storageState) tries to read it
  const response = await request.get(`/api/manufacturer/${id}`);

  // Assert
  expect(response.status()).toBe(404);
});

test('agency B cannot create a report for an agency A manufacturer', async ({ request }) => {
  // Arrange — create manufacturer under agency-a
  const agencyACtx = await makeAgencyAContext();
  const { id: manufacturerId } = await createManufacturer(agencyACtx, { name: 'AgencyA Mfr', iconColor: '#00AA00' });
  await agencyACtx.dispose();

  // Act — agency-b session tries to create a report referencing agency-a's manufacturer
  const response = await request.post('/api/report', {
    data: { manufacturerId, branch: 'East', name: 'Illegal Report', category: 'life' },
  });

  // Assert
  expect(response.status()).toBe(403);
});
