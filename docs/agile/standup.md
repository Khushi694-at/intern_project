# Daily Standup Log

One or two lines per working day: what I did, what's next, any blockers.

## Day 1 — 2026-08-24 (Sprint 0: Setup & Discovery)

- **Did:** Initialised the repo with the agreed folder structure; scaffolded Node/TypeScript/Playwright/ESLint/Prettier
  tooling; wrote the README skeleton; hand-explored every in-scope ParaBank flow (register, login, accounts overview,
  open account, transfer, bill pay, find transactions, update contact info) plus the REST API base path; drafted the
  backlog board.
- **Next:** Start Sprint 1 — write the Test Plan and RTM skeleton, then design the ≥40 test cases.
- **Blockers:** None. Noted 3 quirks in `docs/exploration-notes.md` to fold into test design (Open-Account's
  unbacked "$100 minimum" copy, an unverified over-balance transfer, and the API's default-XML responses).

## Day 2 — 2026-08-25 (Sprint 2: Framework Foundation, Days 3-4)

- **Did:** Built the TS + OOP backbone: `BasePage` (nav/wait/action helpers), an environment `config` module
  (qa/staging/local, `.env`-driven overrides), a scoped `Logger`, typed test-data interfaces (`src/data/types.ts`),
  a registration-data generator, two page objects (`LoginPage`, `RegisterPage`), and Playwright fixtures wiring
  them together. Added 3 smoke tests (2 UI, 1 API) and a GitHub Actions CI skeleton; all 3 pass green locally with
  the same parallel-worker settings CI will use.
- **Next:** Start Sprint 3 — automate registration/login/account flows with data-driven datasets.
- **Blockers:** None. One real gotcha worth remembering: `page.goto('/index.htm')` against a `baseURL` with no
  trailing slash resolves to the bare host (WHATWG URL treats a leading `/` as root-relative and drops the
  `/parabank` sub-path) — fixed by giving `baseUrl` a trailing slash and using paths with no leading slash.
  Also swapped an exact `a[href="register.htm"]` selector for a role-based locator, since ParaBank appends a
  `;jsessionid=...` to hrefs.

## Day 3 — 2026-08-26 (Sprint 1: Manual QA & Test Design, Day 2)

- **Did:** Went back and completed Sprint 1 (out of order — Sprint 2's framework work landed first): wrote the Test
  Plan (scope, strategy mapped to STLC, environment, risks, entry/exit criteria), designed 69 test cases across all
  7 in-scope journeys with positive/negative cases and explicit BVA/EP tags (registration and transfer-amount
  fields especially), built the Requirements sheet as the RTM (27 requirements, each traced to its test case IDs),
  and ran a first manual pass against the live app that surfaced 6 bugs (2 Critical/P1 data-integrity defects on
  Transfer Funds and Bill Pay, plus 4 lower-severity validation/UX gaps), logged with severity, priority, repro
  steps, and life-cycle state.
- **Next:** Move on to Sprint 3 — automate the core journeys with the Page Object Model, starting with the flows
  the manual pass already exercised.
- **Blockers:** None. One process note: designing test cases *after* touching the live app (rather than purely
  from the spec) caught two gaps the spec alone wouldn't have — the missing amount-input field on Open New Account,
  and the fact that Transfer Funds doesn't visibly block over-balance transfers — both became explicit BVA cases
  and, on execution, real bug reports (BUG-01).

## Day 4 — 2026-08-27 (repo hygiene)

- **Did:** Fixed a structural issue found while reviewing the repo against the project brief: the git repo root
  was one level above this project (a `banking-automation/` wrapper folder), which meant `.github/workflows/`
  wasn't where GitHub Actions looks for it and CI could never have run. Flattened the repo so this folder is the
  repo root directly. Also moved the Sprint 1 manual QA artifacts (test plan, test cases, bug reports), which had
  been written as loose files outside the repo, into `docs/` where the project brief expects them.
- **Next:** Re-run `npm install` at the new root and confirm CI actually triggers on the next push.
- **Blockers:** None.

## Day 5 — 2026-08-30 (Sprint 3: UI Automation, Days 5-6)

- **Did:** Built out the remaining page objects (`OverviewPage`, `OpenAccountPage`, `TransferFundsPage`,
  `BillPayPage`, `FindTransactionsPage`) and the fixtures that wire them together, then automated the core
  journeys: data-driven registration/login, account overview + open-account (asserting the exact $100 opening
  balance), transfer funds and bill pay (asserting balance deltas, not just confirmation text), and
  find-transactions across all four search modes plus a negative case. Two balance-asserting tests deliberately
  drive an account over-balance/negative to confirm BUG-01/BUG-02 are still open, rather than assuming they'd
  been fixed.
- **Next:** Stabilise against ParaBank's shared-instance flakiness, then start Sprint 4 (API/Postman/SQL).
- **Blockers:** ParaBank's registration endpoint intermittently rejected every new signup on the shared demo
  instance — reworked the balance-asserting journeys (transfer, bill pay, open-account) to log into the
  permanently-seeded `john`/`demo` user instead of registering a fresh customer per test, since those journeys
  only need *an* account, not a *new customer*.

## Day 6 — 2026-08-31 (Sprint 3 stabilisation)

- **Did:** Diagnosed CI-only failures (every page timing out, unrelated to what the test did) as ParaBank's
  shared demo instance rate-limiting/cooling down under CI's burst of back-to-back requests — never reproduced
  from a residential IP. Added a `requestPacing` auto-fixture that pauses between tests in CI only, and pinned
  the config to a single worker so parallel workers can't race each other's transfers/payments against the one
  shared account. All 24 UI tests green, locally and in CI.
- **Next:** Sprint 4 — Postman collection, automated API tests, hybrid test, SQL data-validation module.
- **Blockers:** None.

## Day 7 — 2026-09-17 (Sprint 4: API & Data, Days 7-8)

- **Did:** Before writing any client code, probed every planned ParaBank REST endpoint live with `curl` to
  confirm its real shape rather than assume it from the UI/docs — good thing: `createAccount` turned out to
  live at `POST /createAccount?customerId=&newAccountType=&fromAccountId=` (query params), not the
  `/accounts/{customerId}/{type}/{fromAccountId}` path shape the rest of `/accounts` would suggest, and
  "find transaction by id" is unscoped (`/transactions/{id}`), not nested under `/accounts/{accountId}/...`.
  Built `ParaBankApiClient` and 12 automated API tests (customer/account lookups, login, create-account +
  transfer with polling for the async $100 opening deposit, transaction search, and one hybrid test that
  creates an account via the API and verifies it through the UI overview page) plus a matching 12-request
  Postman collection, cross-checked against the Playwright suite with `newman`. Also built the SQL layer:
  a seeded `customers`/`accounts`/`transactions` schema, a typed `BankDatabase` module (SELECT+WHERE, ranged
  WHERE, JOIN, JOIN+GROUP BY), and 4 tests — one of which independently recomputes the expected total in
  TypeScript rather than trusting the SQL aggregate at face value.
- **Next:** Sprint 5 — wire the SQL seed into CI (`globalSetup`), add a typecheck step, and finish the AI-usage
  log, locator-strategy doc, README, and final report.
- **Blockers:** Verifying the Postman collection with rapid-fire `newman` runs right after building it tripped
  the same rate-limit/cooldown on ParaBank's shared instance that Sprint 3 hit in CI — this time from a local
  dev machine, confirming it's IP-burst-triggered rather than CI-specific. Waited it out and re-verified rather
  than assuming the collection itself was wrong.

## Day 8 — 2026-09-17 (Sprint 5: CI/CD, Reporting & Polish, Days 9-10)

- **Did:** Added `globalSetup` to `playwright.config.ts` so `sql/bank.sqlite` is reseeded automatically before
  every test run (no separate CI step to forget), added a `typecheck` script/CI step ahead of the test run, and
  wrote the remaining docs the brief requires: `docs/locators.md` (locator-priority strategy, and why some CSS
  id/attribute selectors are still "resilient" given ParaBank's markup), `docs/ai-usage-log.md`, and
  `docs/final-report.md`. Updated the README and this backlog to reflect Sprints 3-5 as complete.
- **Next:** Push, open a PR to `main`, and confirm the pipeline is green with the HTML report attached before
  submission.
- **Blockers:** None. One known gap called out honestly in the final report rather than glossed over: the RTM
  (`docs/test-cases.xlsx`) still traces manual/UI test cases only — it doesn't yet have rows for the new API/SQL
  automated tests.
