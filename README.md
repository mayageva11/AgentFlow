# AgentFlow Hub — QA Automation Portfolio

End-to-end automation suite for an insurance commission upload platform. Built to demonstrate production-grade QA engineering: the Testing Pyramid, Page Object Model, network interception, and multi-tenant security validation.

**Live demo (Allure report):** https://mayageva11.github.io/AgentFlow/

---

## Testing strategy: Dual-Layer Architecture

This project implements a deliberate separation between UI concerns and business logic, following the Testing Pyramid:

```
         ┌─────────────────────────┐
         │   Layer 1 — UI Tests    │  Fast · Mock-driven · Deterministic
         │   tests/e2e/            │  page.route() intercepts /api/dashboard
         └─────────────────────────┘
         ┌─────────────────────────┐
         │   Layer 2 — API Tests   │  Robust · Real server · Business logic
         │   tests/api/            │  Status codes · Duplicates · Isolation
         └─────────────────────────┘
```

**Layer 1 — Mock-Driven UI Tests** (`tests/e2e/`)

UI tests never touch the real backend. `page.route()` intercepts `/api/dashboard` before navigation, injects controlled JSON, and asserts the DOM response. This makes UI tests:
- Instantaneous (no server round-trips)
- Deterministic (no shared state between runs)
- Focused on rendering logic only

**Layer 2 — API Business Logic Tests** (`tests/api/`)

All hard requirements — status codes, all-or-nothing rejection, SHA-256 duplicate detection, and multi-tenancy — are validated directly against the server using Playwright's `APIRequestContext`. No browser, no UI, pure contract verification.

---

## Test coverage

| Test file | Layer | What it validates |
|---|---|---|
| `upload.api.spec.ts` | API | Status 50/61/67/70 · All-or-nothing rule · Duplicate SHA-256 rejection |
| `manufacturer.api.spec.ts` | API | Create and retrieve manufacturer · 404 on unknown ID |
| `report.api.spec.ts` | API | Create report · Cross-manufacturer 403 · Template XLSX headers |
| `isolation.api.spec.ts` | API | Agency B cannot read/write Agency A resources (3 scenarios) |
| `dashboard.ui.spec.ts` | UI | Mock success renders rows · Mock 500 shows error-message element |
| `responsive.spec.ts` | UI | Login + Dashboard fit viewport on Mobile/Tablet (3 device profiles) |

**26 tests across 4 Playwright projects:** Desktop Chrome · Mobile Safari · Tablet Chrome · Data Isolation Security

---

## Quick start

```bash
git clone https://github.com/mayageva11/AgentFlow
cd AgentFlow
npm install
npx playwright install chromium
npm run generate:fixtures
npm test
```

```bash
npm run test:report   # open Allure report
```

---

## Architecture

### Page Object Model

All locators use `data-testid` attributes — no raw CSS selectors in specs. POMs live in `tests/pages/`, injected via `testBase.ts` fixtures:

| Element | `data-testid` | POM property |
|---|---|---|
| Email input | `login-email` | `loginPage.emailInput` |
| Password input | `login-password` | `loginPage.passwordInput` |
| Submit button | `login-submit` | `loginPage.submitButton` |
| Error message | `error-message` | `dashboardPage.dashboardError` |
| Commission table | `dashboard-table` | `dashboardPage.reportsTable` |
| Table row | `dashboard-row` | `dashboardPage.getRowLocator(name)` |

### Network interception

```typescript
// tests/e2e/dashboard.ui.spec.ts
await page.route('**/api/dashboard', route =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify([MOCK_REPORT]) })
);
await dashboardPage.navigate();
await expect(dashboardPage.getRowLocator(MOCK_REPORT.manufacturer)).toBeVisible();
```

### Multi-tenant isolation

Session cookies are `httpOnly` — the agencyId is never trusted from the client. The "Data Isolation Security" Playwright project re-runs `isolation.api.spec.ts` with agency-B credentials, asserting that cross-tenant reads return `404` and cross-tenant writes return `403`.

### Server business rules

| Rule | Implementation |
|---|---|
| Status codes | `50` success · `61` empty · `67` bad format/duplicate · `70` bad month |
| All-or-nothing | First invalid row → whole file rejected |
| Duplicate detection | SHA-256 hash stored in-memory per server lifetime |
| Tenant isolation | `agencyId` from `httpOnly` cookie scopes all resources |
| Month format | `MM-YYYY` required; any other format → status 70 |

---

## Project structure

```
src/
  server/        Express API — /api/upload, /api/manufacturer, /api/report, /api/dashboard
  pages/         login.html · dashboard.html (two clean pages, no env checks)
tests/
  api/           upload · manufacturer · report · isolation (API-level business logic)
  e2e/           dashboard.ui · responsive (mock-driven browser tests)
  pages/         LoginPage.ts · DashboardPage.ts (data-testid locators)
  fixtures/      testBase.ts — DI via test.extend()
  helpers/       manufacturerHelper · reportHelper · uploadHelper
  global-setup.ts  Pre-authenticates agency-a and agency-b sessions
fixtures/        Generated XLSX files (unique SHA-256 hashes per file)
scripts/         generateFixtures.ts
docs/            test-plan.md
```

---

## CI/CD

Every push to `main`:

1. Install deps and Playwright Chromium
2. Generate XLSX fixture files
3. Run all tests
4. Generate Allure report
5. Push static site to `gh-pages` branch (Allure report + HTML pages)

> **GitHub Pages setup:** Settings → Pages → Source → **Deploy from a branch** → `gh-pages` / `/ (root)`

---

## Technologies

| Tool | Role |
|---|---|
| **Playwright** | Browser automation, API testing, network mocking, multi-project |
| **TypeScript** (strict) | End-to-end type safety |
| **Express.js** | Mock insurance platform API |
| **Allure** | Test report generation |
| **GitHub Actions** | CI with automated Pages deployment |
| **XLSX** | Fixture generation and server-side file parsing |

---

## Demo credentials

| Account | Email | Password |
|---|---|---|
| Agency A | `agency-a@agentflow.dev` | `Test1234!` |
| Agency B | `agency-b@agentflow.dev` | `Test1234!` |

Click either row on the Login page to auto-fill credentials.

---

*Built with [Claude Code](https://claude.ai/code)*
