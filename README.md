# AgentFlow Hub: Custom-Built Enterprise Test Ecosystem

> **Architectural Premise:** To comply with live enterprise testing constraints while demonstrating complete domain mastery, this repository contains a custom-engineered "Twin Ecosystem." It mirrors the complex operational and security challenges of an insurance commission platform—specifically targeting multi-tenant multi-agency boundaries, atomic file parsing logic, and network failure resilience without modifying live production configurations.

## 🚀 Live Simulation Links

The frontend client application is fully deployed and accessible via GitHub Pages. Reviewers can explore the functional interface instantly:

* **Main Portfolio Hub & Landing Page:** https://mayageva11.github.io/AgentFlow/
* **Multi-Tenant Secure Login Screen:** https://mayageva11.github.io/AgentFlow/login.html
* **Simulated Commission Dashboard:** https://mayageva11.github.io/AgentFlow/dashboard.html
* **File Intake & Downloads Module:** https://mayageva11.github.io/AgentFlow/downloads.html

## 🤖 AI-Accelerated Engineering (Built with Claude Code)

This entire framework was architected, refactored, and optimized utilizing **Claude Code** (Anthropic's official CLI engineering tool) as a core AI development collaborator. Embracing this modern AI-assisted engineering workflow enabled:

* **High-Velocity Refactoring:** Swift migration from legacy raw selectors into strictly-typed, modular Page Object Models (POM).
* **Resilience Guardrails:** Efficiently implementing zero-config fallback logic and complex automated environment detection (`isGitHubPages`).
* **Advanced Automation Scenarios:** Orchestrating intricate network interception strategies (`page.route`) and unified webserver lifecycle automation.

## 📋 Complete Automation Flow & Test Coverage

The automated suite tests a realistic, end-to-end multi-tenant business loop:

1. **Global Authentication (`global-setup.ts`):** The execution pipeline initiates by authenticating via the login interface using designated multi-tenant test credentials (`agency-a@agentflow.dev`). It captures the server-issued `httpOnly` session storage state, saving it locally.
2. **Session Reuse:** Subsequent test suites reuse this global storage state to bypass repetitive login screens entirely, jumping straight into authenticated components (`/dashboard` and `/downloads`) to maximize test speed and mimic enterprise behavior.
3. **Core Functional Assertions:**
   * **File Upload Verification:** Validating strict XLSX parsing rules (empty files, missing required headers, bad month schemas, and unrecognized business categories).
   * **Atomic Processing:** Guaranteeing "all-or-nothing" enforcement—where a single malformed row (Status 70) triggers an absolute rejection of the entire ledger to safeguard data integrity.
   * **Manufacturer & Report Creation:** Provisioning dynamic, scoped entities tied securely to the active authenticated agency context.
   * **Cryptographic Deduplication:** Preventing race conditions or redundant operations via a server-lifetime SHA-256 duplicate file hashing registry.

## 🛠️ Setup & Quick Start

Execute the complete end-to-end framework inside a single terminal window:

```bash
npm install
npx playwright install chromium
npm run generate:fixtures
```

**Run tests (headless):**
```bash
npm run server &
npm test
```

**Run tests (headed — watch the browser):**
```bash
npm run server &
npm run test:headed
```

**View interactive HTML report after a run:**
```bash
npm run test:report
```

## 🏗️ Architectural Decisions

### Twin Mirror Ecosystem

Rather than configuring a live production environment, the repository ships its own production-equivalent Express.js server (`src/server/`) that faithfully replicates every edge case the real platform enforces: httpOnly session cookies for agency scoping, SHA-256 deduplication, atomic XLSX validation, and fully typed REST endpoints. This means every test scenario executes against a deterministic, isolated replica—identical business logic, zero risk to production data.

### Dual-Layer Mocking Strategy

Two complementary mocking layers operate simultaneously:

| Layer | Mechanism | Purpose |
|---|---|---|
| **Backend (CI)** | Claude API (`claude-sonnet-4-6`) generates realistic commission data at build time | Dashboard shows authentic-looking records on GitHub Pages |
| **Frontend (Browser)** | Playwright `page.route()` intercepts network calls | Verifies UI resilience against 500 errors without any backend involvement |

See `tests/e2e/networkMocking.spec.ts` for the browser-layer implementation.

### Page Object Model + Playwright Custom Fixtures (Dependency Injection)

Every UI selector lives in a dedicated typed class under `tests/pages/`. These objects are injected into tests automatically via `tests/fixtures/testBase.ts`, which extends Playwright's base `test`. Spec files contain zero raw locators—only semantic method calls:

```typescript
await downloadsPage.uploadExcelFile(getFixture('valid-upload-e2e.xlsx'));
await downloadsPage.assertUploadStatus('50');
```

A single selector change in a page class propagates to every test that uses it—no grep, no mass find-and-replace.

### Strict Multi-Tenant Security Model

`agencyId` is never trusted from the client. The Express server reads it exclusively from a server-set `httpOnly` cookie. A dedicated `Data Isolation Security` Playwright project cross-checks agency-A resources from an agency-B session context, verifying that cross-tenant data leakage is architecturally impossible.

### Cross-Device Testing without WebKit on ARM

Chromium with manually specified viewport dimensions (`390×844` for iPhone 14, `834×1194` for iPad Pro 11) is used instead of `webkit`, which is unsupported on Apple Silicon GitHub Actions runners. Three Playwright projects run responsive assertions simultaneously: Desktop Chrome, Mobile Safari (Chromium), and Tablet Chrome.

### SHA-256 Deduplication with Test-Scoped Fixtures

Nine distinct XLSX fixture files with unique binary content guarantee zero SHA-256 hash collisions across parallel test workers. Each test is independently reproducible regardless of execution order.

## 📁 Project Structure

```
src/
  server/          Express API — upload, manufacturer, report routes
  claude/          Claude API integration — dashboard data generation
  pages/           Login, dashboard, downloads HTML + portfolio landing
tests/
  api/             API-level specs (Playwright APIRequestContext only)
  e2e/             Browser-driven end-to-end specs
  fixtures/        testBase.ts — custom test fixture with DI page objects
  helpers/         Shared API helpers (manufacturer, report, upload)
  pages/           Page Object Model classes (LoginPage, DashboardPage, DownloadsPage)
  global-setup.ts  Auth pipeline — saves httpOnly session cookies for both agencies
fixtures/          Generated XLSX files (9 files, unique SHA-256 hashes)
scripts/           generateFixtures.ts · generateStaticDashboard.ts
.github/workflows/ CI pipeline — test → report → GitHub Pages deploy
```

## ⚙️ CI/CD Pipeline

Every push to `main` triggers a single GitHub Actions job:

1. Install Node 20 dependencies and Playwright Chromium
2. Generate all XLSX fixture files
3. Start the Express server; wait on `/health`
4. Run the full 29-test suite across 4 Playwright projects
5. Call the Claude API to pre-generate realistic dashboard data
6. Build the Allure report from test results
7. Assemble the `gh-pages/` static site (landing + HTML pages + report + data)
8. Deploy to GitHub Pages via `actions/deploy-pages` (OIDC-secured)

The `ANTHROPIC_API_KEY` secret must be set in repository settings for Claude API calls. The deployment step requires GitHub Pages source to be set to **GitHub Actions** in repository settings.

## 🔧 Technologies

| Tool | Role |
|---|---|
| **Playwright** | Browser automation, API testing, network mocking, multi-project config |
| **TypeScript** (strict) | End-to-end type safety across server, tests, and scripts |
| **Express.js** | Custom insurance platform replica — upload, manufacturer, report APIs |
| **Claude API** (`claude-sonnet-4-6`) | Realistic commission data generation; dashboard badge integration |
| **Allure** | Test report generation and artifact publishing |
| **GitHub Actions** | CI pipeline with OIDC-based GitHub Pages deployment |
| **XLSX** | Fixture generation and server-side file parsing |

---

*Engineered with [Claude Code](https://claude.ai/code) — Anthropic's official CLI for AI-assisted software development.*
