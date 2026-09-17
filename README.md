# Banking Automation — SDET Capstone

A CI-integrated test automation suite for **ParaBank** (https://parabank.parasoft.com/parabank/index.htm),
combining manual QA artifacts with a Playwright + TypeScript automation framework, Postman API tests,
and a SQL data-validation module.

> Status: All 5 sprints complete. Manual QA pack (test plan, 69 test cases, RTM, 6 bug reports), a
> 40-test automated suite (24 UI + 12 API + 4 SQL) organised as a reusable TS/OOP framework, a
> Postman collection mirroring the API layer, and a green CI pipeline publishing the HTML report.

## Stack

- **UI automation:** Playwright + TypeScript, Page Object Model
- **API testing:** Postman collection + Playwright API (request context)
- **Data validation:** SQLite + TypeScript data-access module
- **CI/CD:** GitHub Actions, Playwright HTML report as build artifact

## Getting started

```bash
npm install
npx playwright install --with-deps
```

Copy `.env.example` to `.env` if you want to override the target environment (defaults to
ParaBank's public `qa` instance, no setup required).

## Running the suite

```bash
npm run test          # everything (UI + API + SQL) — reseeds sql/bank.sqlite first via globalSetup
npm run test:ui       # UI specs only
npm run test:api      # API specs only (incl. the hybrid API-seeds/UI-verifies test)
npm run test:sql      # SQL data-validation specs only
npm run test:report   # open the last HTML report
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
```

All three suites hit the live ParaBank demo (or, for the SQL suite, a local seeded SQLite file —
no shared demo dependency there). Tests run single-worker by design: several UI/API journeys share
ParaBank's one persistent seeded demo account (`john`/`demo`) and assert on its balance deltas, so
parallel workers would race each other.

### SQL data-validation module

```bash
npm run sql:seed      # (re)creates sql/bank.sqlite from sql/schema.sql + sql/seed-data.sql
```

`sql/schema.sql` defines a small `customers`/`accounts`/`transactions` schema, `sql/seed-data.sql`
seeds deterministic rows, and `sql/queries.sql` documents the SELECT/WHERE/JOIN/GROUP BY queries
that `src/data/db.ts` (`BankDatabase`) runs and `tests/sql/data-validation.spec.ts` asserts on.
`sql/bank.sqlite` itself is gitignored and reseeded automatically before every Playwright run.

### Postman collection

Import `api/postman/ParaBank.postman_collection.json` and `api/postman/ParaBank.postman_environment.json`
into Postman, select the "ParaBank - QA" environment, and run requests top-to-bottom within each
folder (Create Account must run before Get New Account/Transfer/Transactions, since it populates
`{{newAccountId}}`). To run it headlessly instead:

```bash
npx newman run api/postman/ParaBank.postman_collection.json -e api/postman/ParaBank.postman_environment.json
```

## Project layout

```
banking-automation/
├── .github/workflows/ci.yml   # GitHub Actions pipeline
├── src/
│   ├── core/       # BasePage, fixtures, ParaBankApiClient, global-setup
│   ├── pages/      # one page object per screen
│   ├── data/       # test-data types, API response types, SQL access module (db.ts)
│   └── utils/      # config, logger, generators, currency parsing
├── tests/
│   ├── ui/         # Playwright UI specs
│   ├── api/        # automated API specs (incl. the hybrid API-seeds/UI-verifies test)
│   └── sql/        # SQL data-validation specs
├── api/postman/    # collection + environment JSON
├── sql/            # schema/seed-data/queries .sql files + seed.js
├── docs/           # test-plan, test-cases, RTM, bug-reports,
│                   #   locators, ai-usage-log, agile/, final-report
├── playwright.config.ts
├── package.json
└── README.md
```

## Docs

- [`docs/exploration-notes.md`](docs/exploration-notes.md) — Day-1 walkthrough of every in-scope ParaBank flow, plus quirks found.
- [`docs/test-plan.md`](docs/test-plan.md) — scope, strategy mapped to STLC, environment, risks, entry/exit criteria.
- [`docs/test-cases.xlsx`](docs/test-cases.xlsx) — 69 manual test cases (positive/negative, BVA/EP tagged) across all 7 in-scope journeys, plus a Requirements sheet (the RTM) and a Summary sheet.
- [`docs/bug-reports.md`](docs/bug-reports.md) — 6 defects found during the first manual pass, with severity, priority, repro steps, and life-cycle state.
- [`docs/locators.md`](docs/locators.md) — locator-priority strategy and why some CSS id/attribute selectors are still "resilient" given ParaBank's markup.
- [`docs/ai-usage-log.md`](docs/ai-usage-log.md) — meaningful AI-assisted tasks per sprint, what was accepted/rejected, and how each was verified (incl. a wrong first guess about a REST endpoint, caught by testing against the live app).
- [`docs/final-report.md`](docs/final-report.md) — what was built, coverage summary, what's next, and the three biggest lessons.
- [`docs/agile/backlog.md`](docs/agile/backlog.md) — sprint backlog, user stories.
- [`docs/agile/standup.md`](docs/agile/standup.md) — daily standup log.

## Viewing the CI report

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint → typecheck → the full Playwright suite
(UI + API + SQL) on every push/PR to `main`, and uploads the HTML report as a build artifact — download it
from the workflow run's **Artifacts** section and open `index.html`.
