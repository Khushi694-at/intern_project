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
