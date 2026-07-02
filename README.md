# AgentFlow Hub — QA Automation Portfolio

End-to-end automation suite for an insurance commission upload platform, built as a portfolio project to demonstrate QA engineering practices: Page Object Model, network interception, multi-tenant isolation, and CI/CD deployment.

**Live demo:** https://mayageva11.github.io/AgentFlow/

---

## What this tests

The suite covers the **Manual Import** feature described in the assignment:

| Scenario | Status code | Test file |
|---|---|---|
| Valid XLSX with correct fields and MM-YYYY month | `50` — Success | `upload.api.spec.ts` |
| XLSX with headers only, no data rows | `61` — Empty file | `upload.api.spec.ts` |
| Missing required field or invalid category | `67` — Bad format | `upload.api.spec.ts` |
| Month in wrong format (e.g. `2024/01`) | `70` — Bad month | `upload.api.spec.ts` |
| One bad row among valid rows — whole file rejected | `67` — All-or-nothing | `upload.api.spec.ts` |
| Byte-identical file uploaded twice | Duplicate rejected | `fullFlow.e2e.spec.ts` |
| Full E2E: create insurer → report → upload | `50` shown in UI | `fullFlow.e2e.spec.ts` |
| Agency B cannot access Agency A's resources | `404` / `403` | `isolation.spec.ts` |
| Dashboard renders mocked API response | Table populated | `networkMocking.spec.ts` |
| Dashboard shows error state on 500 | Error UI shown | `networkMocking.spec.ts` |

**29 tests across 4 Playwright projects:** Desktop Chrome · Mobile Safari · Tablet Chrome · Data Isolation Security

---

## Quick start

### Option A — Docker (recommended, no local Node server needed)

```bash
git clone https://github.com/mayageva11/AgentFlow
cd AgentFlow
npm install
npx playwright install chromium
npm run generate:fixtures

# Start the server in Docker
docker-compose up -d

# Run all tests
npm test

# Stop
docker-compose down
```

### Option B — local server

```bash
npm install
npx playwright install chromium
npm run generate:fixtures
npm run server &
npm test
```

### View test report

```bash
npm run test:report
```

---

## Project structure

```
src/
  server/        Express API — /api/upload, /api/manufacturer, /api/report, /api/dashboard
  pages/         Login · Dashboard · Downloads · Landing (HTML)
tests/
  api/           API-level specs (Playwright APIRequestContext — no browser)
  e2e/           Browser E2E specs
  pages/         Page Object Model classes — LoginPage, DashboardPage, DownloadsPage
  fixtures/      testBase.ts — custom fixture with DI page objects
  helpers/       Shared API helpers for test setup
  global-setup.ts  Authenticates both agency sessions before the suite runs
fixtures/        Generated XLSX files (9 files, unique SHA-256 hashes)
scripts/         generateFixtures.ts · generateStaticDashboard.ts
docs/            test-plan.md — P0/P1/P2 scenario inventory
```

---

## Architecture decisions

### Mock server mirrors the real platform

The Express server in `src/server/` replicates every rule from the assignment spec:

- `httpOnly` session cookies encode `agencyId` — never trusted from the client
- SHA-256 duplicate detection — server-lifetime hash registry
- All-or-nothing XLSX validation — first bad row rejects the entire file
- Status codes exactly as specified: `50 / 61 / 67 / 70`

### Page Object Model + Dependency Injection

All locators live in typed classes under `tests/pages/`. Tests receive page objects via `testBase.ts` fixtures — no `new` in spec files, zero raw selectors in specs:

```typescript
// tests/e2e/fullFlow.e2e.spec.ts
test('happy path: create manufacturer, create report, upload valid file', async ({
  downloadsPage, api, getFixture,
}) => {
  const { id: manufacturerId } = await createManufacturer(api, {
    name: 'FlowTest Corp', iconColor: '#00D4D4',
  });
  await createReport(api, { manufacturerId, branch: 'Life & Finance', name: 'Q1', category: 'life' });
  await downloadsPage.navigate();
  await downloadsPage.setUploadFile(getFixture('valid-upload-e2e.xlsx'));
  await downloadsPage.clickUpload();
  await expect(downloadsPage.uploadResult).toContainText('50');
});
```

### Network interception (Playwright `page.route`)

`networkMocking.spec.ts` intercepts `/api/dashboard` before navigation, injects mock JSON, and asserts the UI renders it — no backend dependency:

```typescript
await page.route('**/api/dashboard', route =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify([MOCK_REPORT]) })
);
await dashboardPage.navigate();
await expect(dashboardPage.getRowLocator(MOCK_REPORT.manufacturer)).toBeVisible();
```

### Multi-tenant isolation

Agency IDs are scoped server-side to `httpOnly` session cookies. A dedicated `Data Isolation Security` Playwright project re-runs targeted tests with agency-B credentials, asserting `404`/`403` on agency-A resources.

### Cross-device responsive testing

Mobile Safari and Tablet Chrome projects use Chromium with real iPhone 14 / iPad Pro viewport dimensions — WebKit is not available on ARM GitHub Actions runners.

---

## CI/CD

Every push to `main`:

1. Install dependencies and Playwright Chromium
2. Generate XLSX fixture files
3. Run all 29 tests (webServer in `playwright.config.ts` manages the Express lifecycle)
4. Generate Allure report
5. Build the `gh-pages/` static site
6. Push to `gh-pages` branch → GitHub Pages publishes automatically

> **GitHub Pages setup:** repository Settings → Pages → Source → **Deploy from a branch** → `gh-pages` / `/ (root)`

---

## Technologies

| Tool | Role |
|---|---|
| **Playwright** | Browser automation, API testing, network mocking, multi-project config |
| **TypeScript** (strict) | End-to-end type safety across server, tests, and scripts |
| **Express.js** | Mock insurance platform — upload, manufacturer, report, dashboard APIs |
| **Docker** | Containerised server — `docker-compose up` replaces `npm run server` |
| **Allure** | Test report generation and artifact publishing |
| **GitHub Actions** | CI pipeline with automated Pages deployment |
| **XLSX** | Fixture generation and server-side file parsing |
| **Claude API** | Optional: pre-generates realistic dashboard data at CI build time |

---

## Demo credentials

| Account | Email | Password |
|---|---|---|
| Agency A | `agency-a@agentflow.dev` | `Test1234!` |
| Agency B | `agency-b@agentflow.dev` | `Test1234!` |

Click either account on the Login page to auto-fill credentials.

---

*Built with [Claude Code](https://claude.ai/code) — Anthropic's AI engineering CLI.*
