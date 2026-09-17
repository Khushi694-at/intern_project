# Final Report

## What I built

I built a simple test suite for ParaBank that covers manual testing and three types of automation:

- **Manual QA** (`docs/`): Wrote a test plan, 69 test cases with BVA/EP checks, an RTM, and logged 6 bugs after testing the live app. Two of them (on Transfer Funds and Bill Pay) are real issues that are still there on the demo site.
- **UI automation** (`src/pages/`, `tests/ui/`): Used the Page Object Model to write 24 UI tests. Covered registration, login, account overview, open account, transfer, bill pay and find transactions. For the buggy flows, I kept the tests as they are to confirm the bugs still exist.
- **API automation** (`src/core/ParaBankApiClient.ts`, `tests/api/`): Built a small API client, wrote 12 API tests and created a matching Postman collection of 12 requests. While checking the endpoints with `curl`, I found that `createAccount` uses query params and "find transaction by id" is not under accounts. Also wrote one hybrid test that creates an account via API and checks it on the UI.
- **SQL tests** (`sql/`, `src/data/db.ts`, `tests/sql/`): Created a small SQLite database for customers, accounts and transactions with a helper class. Wrote 4 SQL tests, including one where I calculated the total in TypeScript instead of just trusting the SQL result.
- **CI/CD** (`.github/workflows/ci.yml`): Set up GitHub Actions to run lint, typecheck, UI, API and SQL tests on every push or PR to `main`. Used `globalSetup` to reset the database automatically and uploaded the Playwright HTML report as an artifact.

## Coverage summary

| Layer | Count | Notes |
|---|---|---|
| Manual test cases | 69 | Covered all 7 flows with BVA/EP checks |
| Bug reports | 6 | 2 important bugs found |
| UI automated tests | 24 | Registration, login, accounts, transfer, bill pay, find transactions |
| API automated tests | 12 | Login, accounts, create account, transfer, transaction search + 1 hybrid |
| SQL automated tests | 4 | WHERE, ranged WHERE, JOIN, JOIN+GROUP BY |
| **Total automated tests** | **40** | All passed locally |
| Postman requests | 12 | Same as API tests |

At the moment, the RTM only links to the manual and UI test cases. The API and SQL tests are not yet traced in the RTM.

## What I'd do with more time

1. **Update the RTM** – Add the API and SQL automated tests to it so everything is properly traced back to requirements.
2. **Look into the bugs properly** – I have only documented BUG-01 and BUG-02. If I had access to the actual application code, I would try to fix the balance validation instead of just tracking them in tests.
3. **Run on more browsers** – Right now the tests run only on Chromium with a single worker because the public ParaBank demo site gets rate-limited easily. With a dedicated test environment, I could run cross-browser tests without that issue.

## Three things I learned

1. **Never assume API endpoints.** I thought `createAccount` would follow the same pattern as other account endpoints, but it didn't. Checking each endpoint with `curl` first saved me from writing the wrong client and Postman requests.
2. **Public demo sites bring their own problems.** ParaBank's shared instance slows down or gets rate-limited when there are too many requests in a short time. I saw this happen during UI tests in CI and again while running Newman for the API collection. I had to add small pauses and reduce workers instead of changing the actual tests.
3. **Some things are not instant.** After creating a new account through the API, the $100 opening deposit doesn't appear right away. I learnt to use `expect.poll(...)` to wait and check the balance, rather than asserting it immediately. That made the tests much more stable.