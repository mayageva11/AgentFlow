# AgentFlow

QA automation portfolio project — end-to-end test suite for an insurance commission platform upload flow.

## What it tests

- File upload validation (empty file, missing fields, bad month format, wrong category)
- All-or-nothing row processing — one invalid row rejects the entire file
- Duplicate upload detection via file hash
- Tenant isolation — manufacturers are scoped per agency
- Full UI flow: create manufacturer → create report → upload file → verify status
- Excel template download with correct column headers

## Setup

```bash
npm install
npx playwright install chromium
npm run generate:fixtures
```

## Run tests

**Headless (default):**
```bash
npm run server &
npm test
```

**Headed (watch the browser):**
```bash
npm run server &
npm run test:headed
```

**View HTML report after run:**
```bash
npm run test:report
```

## CI/CD

Every push to `main` and every pull request triggers the GitHub Actions pipeline:

1. Install dependencies and Playwright browsers
2. Generate fixture files
3. Start the Express server
4. Wait for the health endpoint (`/health`)
5. Run the full test suite with `CI=true`
6. Generate an Allure report from test results
7. Upload the Allure report as a build artifact
8. Deploy the report to GitHub Pages on pushes to `main`

The `ANTHROPIC_API_KEY` secret must be set in the repository settings for Claude API calls to work.

## Project structure

```
src/
  server/          Express API — upload, manufacturer, report routes
  claude/          Claude API integration — dashboard data generation
  pages/           Login, dashboard, downloads HTML pages + portfolio landing
tests/
  api/             API-level specs (request context only)
  e2e/             Browser-driven end-to-end specs
  fixtures/        testBase.ts — custom test with injected page objects (DI)
  helpers/         Shared API helpers (manufacturer, report, upload, mock)
  pages/           Page Object Model classes (LoginPage, DashboardPage, DownloadsPage)
  global-setup.ts  Auth setup — saves session cookies for agency-a and agency-b
fixtures/          Generated XLSX files for upload tests
scripts/           generateFixtures.ts — creates all fixture files
docs/              test-plan.md
```

## Smart Architectural Decisions

- **Page Object Model (POM) + Playwright Custom Fixtures (DI)** — Every UI selector and interaction lives in a dedicated page class (`LoginPage`, `DashboardPage`, `DownloadsPage`) under `tests/pages/`. These objects are injected into tests automatically via `tests/fixtures/testBase.ts`, which extends Playwright's base `test` with typed fixtures. Spec files contain zero raw locators — only clean, semantic method calls (`downloadsPage.uploadExcelFile(...)`, `downloadsPage.assertUploadStatus('50')`). A single selector change in a page class fixes every test that uses it.

- **Strict multi-tenant isolation** — `agencyId` is never trusted from the client. The Express server reads it exclusively from a server-set httpOnly cookie (`session`). Isolation is verified by a dedicated `Data Isolation Security` Playwright project that cross-checks agency-A resources from an agency-B session context.

- **Claude API for realistic test data** — Dashboard reports are generated dynamically via `claude-sonnet-4-6` on each page load rather than using static fixtures. The CI dashboard badge makes this integration immediately visible to reviewers.

- **SHA-256 deduplication with test-scoped fixtures** — Upload deduplication uses a per-server-lifetime in-memory hash set. Nine distinct XLSX fixture files ensure no hash collisions between tests, making each test independently reproducible.

- **Cross-device without WebKit on ARM** — Chromium with manually specified iPhone 14 (`390×844`) and iPad Pro 11 (`834×1194`) viewport dimensions is used instead of `webkit`, which is unsupported on Apple Silicon GitHub Actions runners.

## Technologies

- **Playwright** — browser automation and API testing
- **TypeScript** — strict mode throughout
- **Express** — mock server for the insurance platform
- **Claude API** (`claude-sonnet-4-6`) — generates realistic dashboard data and dynamic mock responses
- **GitHub Actions** — CI pipeline with Allure reporting
- **Allure** — test report generation and GitHub Pages deployment

---

Built with AI assistance: Claude by Anthropic
