# Daily Standup Log

Simple updates per working day: what I did, what's next, any blockers.

## Day 1 — 2026-08-24
- **Did:** Set up the repo with folders and basic tools (Node, TypeScript, Playwright, ESLint, Prettier). Manually tested all ParaBank flows like register, login, accounts, open account, transfer, bill pay, find transactions, update contact info and the API. Made a small backlog.
- **Next:** Write the Test Plan, RTM and start making test cases.
- **Blockers:** None. Noted 3 small things in `docs/exploration-notes.md`.

## Day 2 — 2026-08-25
- **Did:** Made basic page classes, config, logger, test data types, a small data generator, Login and Register page objects and fixtures. Wrote 3 small smoke tests (2 UI, 1 API). Also added a basic CI file. All tests passed locally.
- **Next:** Start automating registration, login and account flows.
- **Blockers:** None. Faced a small baseURL slash issue and changed one selector to role-based because ParaBank adds `;jsessionid` to links.

## Day 3 — 2026-08-26
- **Did:** Completed Sprint 1. Wrote the Test Plan, made 69 test cases for all 7 flows, created the RTM with 27 requirements and linked them to test cases. Did a quick manual test and logged 6 bugs (including 2 important ones on Transfer Funds and Bill Pay).
- **Next:** Start automating the main flows using Page Object Model.
- **Blockers:** None. While testing manually, found two things the spec missed — Open New Account had no amount field shown and Transfer Funds allowed over-balance transfers.

## Day 4 — 2026-08-27
- **Did:** Fixed the repo structure. The git repo was one level above the project, so GitHub Actions couldn't find the workflow. Moved it so the project became the repo root. Also moved the manual QA files into `docs/`.
- **Next:** Run `npm install` at the root and check if CI runs on the next push.
- **Blockers:** None.

## Day 5 — 2026-08-30
- **Did:** Made the remaining page objects (Overview, Open Account, Transfer Funds, Bill Pay, Find Transactions). Automated registration, login, account overview, open account, transfer funds, bill pay and find transactions. For transfer and bill pay tests, checked balance changes to confirm the bugs were still there.
- **Next:** Fix flakiness and move to Sprint 4.
- **Blockers:** Registration kept failing on the shared demo site. So instead of creating a new user for every test, I used the existing `john`/`demo` account for balance-related tests.

## Day 6 — 2026-08-31
- **Did:** Fixed CI test failures caused by the shared ParaBank site slowing down when many requests hit at once. Added a small pause in CI between tests and ran with a single worker to avoid tests interfering with each other. All 24 UI tests passed locally and in CI.
- **Next:** Start Sprint 4 — API, Postman and SQL.
- **Blockers:** None.

## Day 7 — 2026-09-17
- **Did:** First checked the real API endpoints with `curl` before coding. Found a few differences (createAccount uses query params, transaction by ID is not under accounts). Built a small API client and wrote 12 API tests. Made a matching Postman collection and verified with Newman. Also created a small SQLite DB with tables for customers, accounts and transactions, built a simple DB helper and wrote 4 SQL tests.
- **Next:** Work on Sprint 5 — DB seed in CI, typecheck, docs and final report.
- **Blockers:** While running Newman locally, got rate-limited by the shared ParaBank site. Waited for a while and tried again.

## Day 8 — 2026-09-17
- **Did:** Added `globalSetup` so the SQLite DB resets before every test run. Added a `typecheck` step in CI. Wrote the required docs (`locators.md`, `ai-usage-log.md`, `final-report.md`), updated the README and this log.
- **Next:** Push, create a PR to `main` and make sure CI passes with the HTML report.
- **Blockers:** None.