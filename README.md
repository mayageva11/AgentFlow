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
  pages/           Login, dashboard, downloads HTML pages
tests/
  api/             API-level specs (request context only)
  e2e/             Browser-driven end-to-end specs
  helpers/         Shared request and mock helpers
  global-setup.ts  Auth setup — runs once before all tests
fixtures/          Generated XLSX files for upload tests
scripts/           generateFixtures.ts — creates all fixture files
docs/              test-plan.md
```

## Technologies

- **Playwright** — browser automation and API testing
- **TypeScript** — strict mode throughout
- **Express** — mock server for the insurance platform
- **Claude API** (`claude-sonnet-4-6`) — generates realistic dashboard data and dynamic mock responses
- **GitHub Actions** — CI pipeline with Allure reporting
- **Allure** — test report generation and GitHub Pages deployment

---

Built with AI assistance: Claude by Anthropic
