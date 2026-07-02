# AgentFlow — Test Plan

## Overview

QA automation suite for the insurance commission upload flow. Tests cover the full lifecycle: authentication, entity creation, file upload validation, and tenant isolation.

---

## P0 — Must pass before any release

| ID | Scenario | Expected | Coverage |
|----|----------|----------|----------|
| P0-01 | Upload valid XLSX with correct fields and MM-YYYY month | Status 50 (success) | `upload.api.spec.ts` |
| P0-02 | Upload XLSX with headers only, no rows | Status 61 (empty file) | `upload.api.spec.ts` |
| P0-03 | Upload XLSX with missing `policy_id` field | Status 67 (bad format) | `upload.api.spec.ts` |
| P0-04 | Upload XLSX with month format `YYYY/MM` instead of `MM-YYYY` | Status 70 (bad month) | `upload.api.spec.ts` |
| P0-05 | Login with valid credentials redirects to `/dashboard` | Redirect + session cookie | `global-setup.ts` |
| P0-06 | Happy path: create manufacturer → create report → upload valid file | UI shows status 50 | `fullFlow.e2e.spec.ts` |

---

## P1 — Tested on every PR

| ID | Scenario | Expected | Coverage |
|----|----------|----------|----------|
| P1-01 | File with one bad row among valid rows — entire file rejected | Status 67 (all-or-nothing) | `upload.api.spec.ts` |
| P1-02 | File with a row whose category is not in allowed set | Status 67 (bad format) | `upload.api.spec.ts` |
| P1-03 | Upload same file twice (byte-identical) | Second upload returns status 67 | `upload.api.spec.ts` |
| P1-04 | Manufacturer created by agency A not accessible by agency B | GET returns 404 | `isolation.api.spec.ts` |
| P1-05 | Create manufacturer — ID appears in response with MFR- prefix | Creator sees ID | `manufacturer.api.spec.ts` |
| P1-06 | Create report linked to manufacturer — response contains RPT- ID | Response contains ID | `report.api.spec.ts` |
| P1-07 | Download Excel template — file contains correct column headers | Headers: month, policy_id, category | endpoint exists (`GET /api/upload/template`); no UI in mock |
| P1-08 | Upload invalid file via UI — correct error code displayed | Error status shown in UI | `fullFlow.e2e.spec.ts` |

---

## P2 — Edge cases, tested weekly

| ID | Scenario | Expected |
|----|----------|----------|
| P2-01 | Upload file with 1000+ rows where last row is invalid | Status 67, no partial processing |
| P2-02 | Upload file with `month` field containing whitespace (`01-2024 `) | Status 70 (strict format enforcement) |
| P2-03 | Upload file with extra columns beyond the required three | Status 50 (extra columns ignored) |
| P2-04 | Create manufacturer with empty `name` field | 400 Bad Request or validation error |
| P2-05 | Create report with non-existent `manufacturerId` | Server accepts (validation deferred to business layer) |
| P2-06 | Concurrent uploads of same file from two parallel requests | Exactly one succeeds (status 50), one rejected (status 67) |
| P2-07 | Login with wrong password | 401, no session cookie set |
| P2-08 | Login with SQL-injection-style email | 401, no crash |
| P2-09 | Upload XLSX with formula injection in policy_id cell | Sanitized / status 50 if fields are otherwise valid |
| P2-10 | Dashboard API call with no session cookie | Response returned (auth not enforced — future hardening) |

---

## Status Code Reference

| Code | Meaning |
|------|---------|
| 50 | Success — file processed |
| 61 | Empty file — headers only, no rows |
| 67 | Bad format — missing required field or invalid category value |
| 70 | Bad month format — expected MM-YYYY |

---

## Valid Categories

Accepted values for the `category` column: `life`, `health`, `pension`, `property`.
