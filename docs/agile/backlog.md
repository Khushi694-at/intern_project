# Backlog

User-story-style tasks, organised by sprint. Check items off as they land; move anything that slips
to the next sprint explicitly rather than silently carrying it.

## Sprint 0 — Setup & Discovery (Day 1)

- [x] As a tester, I can clone a repo with the agreed folder structure so the team has a consistent layout.
- [x] As a tester, I have Node/Playwright/TypeScript/ESLint/Prettier tooling scaffolded so later sprints just add code.
- [x] As a tester, I have walked every in-scope ParaBank flow by hand and registered a test user, so I know the
      real behaviour (and quirks) before I automate it.
- [x] As a tester, I have a backlog board so the remaining 9 days of work are visible and trackable.

## Sprint 1 — Manual QA & Test Design (Day 2)

- [x] As a tester, I can write a Test Plan (scope, strategy mapped to STLC, risks, entry/exit criteria).
- [x] As a tester, I have a requirement list and an RTM skeleton so coverage gaps are visible later.
- [x] As a tester, I can design ≥40 test cases across the core flows using positive/negative, BVA, and EP.
- [x] As a tester, I can do a first manual pass and log ≥6 bugs with severity, priority, and life-cycle state.

## Sprint 2 — Framework Foundation (Days 3-4)

- [x] As an SDET, I can extend a `BasePage` class for shared navigation/wait/action behaviour.
- [x] As an SDET, I have typed test-data interfaces instead of loose objects.
- [x] As an SDET, I have a small utilities layer (config reader, logger, data generator).
- [x] As an SDET, I have 2-3 smoke tests proving the harness works, green in CI.

## Sprint 3 — UI Automation (Days 5-6)

- [ ] As an SDET, I can automate registration & login with data-driven datasets.
- [ ] As an SDET, I can automate account overview, open-account, transfer, and bill pay, asserting on balances.
- [ ] As an SDET, I can automate find-transactions and negative cases.
- [ ] As an SDET, I have ≥15 stable UI tests with resilient locators (no fixed sleeps).

## Sprint 4 — API & Data (Days 7-8)

- [ ] As an SDET, I have a Postman collection covering the key REST services with assertions.
- [ ] As an SDET, I have the same checks re-implemented as automated Playwright API tests.
- [ ] As an SDET, I have one hybrid test (API seeds data, UI verifies it).
- [ ] As an SDET, I have a seeded SQL database and a TypeScript module asserting query results.

## Sprint 5 — CI/CD, Reporting & Polish (Days 9-10)

- [ ] As an SDET, I have a GitHub Actions workflow running the suite green on every push/PR to main.
- [ ] As an SDET, I have the HTML report published as a build artifact.
- [ ] As an SDET, I have a complete AI-usage log, README, and RTM.
- [ ] As an SDET, I have a 1-2 page final report and a rehearsed demo.
