# Banking Automation — SDET Capstone

A CI-integrated test automation suite for **ParaBank** (https://parabank.parasoft.com/parabank/index.htm),
combining manual QA artifacts with a Playwright + TypeScript automation framework, Postman API tests,
and a SQL data-validation module.

> Status: Sprint 0 (Setup & Discovery) — scaffolding in place, app explored. Automation code lands in Sprint 2+.

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

## Running the suite

```bash
npm run test          # everything
npm run test:ui       # UI specs only
npm run test:api      # API specs only
npm run test:report   # open the last HTML report
```

## Project layout

```
banking-automation/
├── .github/workflows/ci.yml   # GitHub Actions pipeline
├── src/
│   ├── core/       # BasePage, fixtures, base test
│   ├── pages/      # one page object per screen
│   ├── data/       # test-data types + DB access module
│   └── utils/      # config, logger, generators
├── tests/
│   ├── ui/         # Playwright UI specs
│   └── api/        # automated API specs
├── api/postman/    # collection + environment JSON
├── sql/            # .sql query files + seed script
├── docs/           # test-plan, test-cases, RTM, bug-reports,
│                   #   locators, ai-usage-log, agile/, final-report
├── playwright.config.ts
├── package.json
└── README.md
```

## Docs

- [`docs/exploration-notes.md`](docs/exploration-notes.md) — Day-1 walkthrough of every in-scope ParaBank flow, plus quirks found.
- [`docs/agile/backlog.md`](docs/agile/backlog.md) — sprint backlog, user stories.
- [`docs/agile/standup.md`](docs/agile/standup.md) — daily standup log.

(Test plan, test cases, RTM, bug reports, AI-usage log, and the final report are added in later sprints —
see the project brief for the full 10-day plan.)

## Viewing the CI report

Once the GitHub Actions workflow (`.github/workflows/ci.yml`) is wired up in Sprint 5, every push/PR to `main`
uploads the Playwright HTML report as a build artifact — download it from the workflow run's **Artifacts** section
and open `index.html`.
