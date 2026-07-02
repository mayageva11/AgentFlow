# AgentFlow Hub — QA Automation 

End-to-end test suite for an insurance commission upload platform. Demonstrates the Testing Pyramid with mock-driven UI tests and API-level business logic validation.

---

## Setup

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/mayageva11/AgentFlow
cd AgentFlow
npm install
npx playwright install chromium
npm run generate:fixtures
```

---

## Run the app locally

```bash
npm run server
```

Open your browser at:

| Page | URL |
|---|---|
| Login | http://localhost:4000/login |
| Dashboard | http://localhost:4000/dashboard |

**Demo credentials** (click either row on the login page to auto-fill):

| Account | Email | Password |
|---|---|---|
| Agency A | `agency-a@agentflow.dev` | `Test1234!` |
| Agency B | `agency-b@agentflow.dev` | `Test1234!` |

The dashboard shows 5 sample commission records immediately. After uploading a file via the API, it shows real data.

---

## Run the tests

The server starts automatically when you run tests — no need to run `npm run server` separately.

```bash
npm test
```

View the HTML report:

```bash
npm run test:report
```

View the Allure report:

```bash
npx allure generate allure-results -o allure-report --clean
npx allure open allure-report
```

---

## What the tests cover

Every test uses `page.route()` to intercept API calls and inject controlled JSON from `tests/mockData.json`. The server never influences test outcomes — tests are deterministic and safe to run any number of times.

`globalSetup` calls `POST /api/reset` before the suite starts; `globalTeardown` calls it again after. This wipes all in-memory state (manufacturers, reports, commission records, duplicate-hash registry) so the server is clean on every run.

### E2E UI tests (`tests/e2e/`)

| File | What it checks |
|---|---|
| `dashboard.ui.spec.ts` | Dashboard renders rows from mocked API · Error state shown on 500 · Agency B data does not leak into Agency A view |
| `fullFlow.e2e.spec.ts` | **Full assignment flow:** create manufacturer → create report → upload (status 50) → commission record visible on dashboard · Upload rejected (67) → no record · Upload rejected (70) → no record |
| `responsive.spec.ts` | Login + Dashboard fit on Mobile Safari · Tablet Chrome · Desktop Chrome |

### API contract tests (`tests/api/`)

These test each API's contract via `page.evaluate()` (so `page.route()` intercepts the calls) and verify the exact response shape from `mockData.json`.

| File | What it checks |
|---|---|
| `upload.api.spec.ts` | Status 50 (valid) · 61 (empty) · 67 (bad format / all-or-nothing) · 70 (bad month) |
| `manufacturer.api.spec.ts` | Create returns `MFR-` ID · Unknown ID returns 404 |
| `report.api.spec.ts` | Create returns `RPT-` ID · Foreign manufacturer returns 403 |
| `isolation.api.spec.ts` | Agency B cannot read Agency A manufacturer · Agency B cannot create report for Agency A manufacturer |

**25 tests across 4 projects:** Desktop Chrome · Mobile Safari · Tablet Chrome · Data Isolation Security

---

## How the assignment flow works

1. **POST `/api/manufacturer`** — register a custom insurer with name + icon color
2. **POST `/api/report`** — create a commission report (branch: Life & Finance / Elementary / Travel, category: life / health / pension / property)
3. **POST `/api/upload`** — upload an XLSX file with columns `month`, `policy_id`, `category`
   - Month must be `MM-YYYY` format → otherwise status `70`
   - File must have at least one data row → otherwise status `61`
   - All rows must be valid → one bad row rejects the whole file (status `67`)
   - Same file uploaded twice → rejected as duplicate (status `67`)
   - All valid → status `50`, data appears in dashboard

---

## Project structure

```
src/
  server/
    index.ts              Express app — routes + session auth
    routes/
      upload.ts           XLSX validation, status codes, duplicate detection
      manufacturer.ts     Manufacturer CRUD
      report.ts           Report CRUD
    validators/           fileValidator, rowValidator, monthValidator
    state.ts              In-memory store (manufacturers, reports, uploads)
  pages/
    login.html            Login page with demo credential cards
    dashboard.html        Commission ledger — fetches /api/dashboard

tests/
  api/
    upload.api.spec.ts    Status code + business rule tests
    manufacturer.api.spec.ts
    report.api.spec.ts
    isolation.api.spec.ts Multi-tenant security tests
  e2e/
    dashboard.ui.spec.ts  Mock-driven dashboard rendering tests
    responsive.spec.ts    Viewport tests (Mobile Safari, Tablet Chrome)
  pages/
    LoginPage.ts          POM — data-testid locators
    DashboardPage.ts      POM — data-testid locators
  fixtures/
    testBase.ts           Custom test fixture with DI page objects
  helpers/                manufacturerHelper, reportHelper, uploadHelper
  global-setup.ts         Pre-authenticates both agency sessions

fixtures/                 Generated XLSX files (9 files)
scripts/
  generateFixtures.ts     Generates all XLSX test fixtures
docs/
  test-plan.md            P0/P1/P2 scenario inventory
```

---

## CI (GitHub Actions)

Every push to `main` runs the full test suite and uploads the Allure report as an artifact. No deployment — tests only.

```
push to main → install → generate fixtures → run 26 tests → allure report → upload artifact
```

Download the Allure report from the Actions tab → latest run → Artifacts → `allure-report`.

---

## Tech stack

| Tool | Role |
|---|---|
| **Playwright** | Browser automation, API testing, network mocking, multi-project runner |
| **TypeScript** | End-to-end type safety across server, tests, and scripts |
| **Express.js** | Mock insurance platform API |
| **XLSX** | Fixture generation and server-side file parsing |
| **Allure** | Test report generation |
| **GitHub Actions** | CI — runs tests on every push |
| **Claude Code** | AI coding assistant used to build and iterate on this project |
