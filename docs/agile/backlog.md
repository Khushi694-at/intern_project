# Backlog

User-story-style tasks, organised by sprint. Check items off as they land; move anything that slips
to the next sprint explicitly rather than silently carrying it.

## Sprint 0 — Setup & Discovery (Day 1)

-  I can clone a repo with the agreed folder structure so the team has a consistent layout.
-  I have Node/Playwright/TypeScript/ESLint/Prettier tooling scaffolded so later sprints just add code.
-  I have a backlog board so the remaining 9 days of work are visible and trackable.

## Sprint 1 — Manual QA & Test Design (Day 2)

- , I can write a Test Plan (scope, strategy mapped to STLC, risks, entry/exit criteria).
-  I have a requirement list and an RTM skeleton so coverage gaps are visible later.
-  I can design ≥40 test cases across the core flows using positive/negative, BVA, and EP.
-  I can do a first manual pass and log ≥6 bugs with severity, priority, and life-cycle state.

## Sprint 2 — Framework Foundation (Days 3-4)
 I can extend a `BasePage` class for shared navigation/wait/action behaviour.
-  I have typed test-data interfaces instead of loose objects.
-  I have a small utilities layer (config reader, logger, data generator).
-  I have 2-3 smoke tests proving the harness works, green in CI.

## Sprint 3 — UI Automation (Days 5-6)
 I can automate registration & login with data-driven datasets.
-  I can automate account overview, open-account, transfer, and bill pay, asserting on balances.
-  I can automate find-transactions and negative cases.
-  I have ≥15 stable UI tests with resilient locators .
## Sprint 4 — API & Data (Days 7-8)

-  I have a Postman collection covering the key REST services with assertions.
-  I have the same checks re-implemented as automated Playwright API tests.
-  I have one hybrid test (API seeds data, UI verifies it).
-  I have a seeded SQL database and a TypeScript module asserting query results.

## Sprint 5 — CI/CD, Reporting & Polish (Days 9-10)

-  I have a GitHub Actions workflow running the suite green on every push/PR to main.
-  I have the HTML report published as a build artifact.
-  I have a complete AI-usage log, README, and RTM.
-  I have a 1-2 page final report and a rehearsed demo.
