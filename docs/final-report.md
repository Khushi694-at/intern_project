# Final Report — Banking Automation SDET Capstone

## What was built

A CI-integrated test suite for ParaBank spanning manual QA artifacts and three layers of
automation, organised as a reusable framework rather than a pile of scripts:

- **Manual QA** (`docs/`): a test plan mapped to STLC, 69 test cases (BVA/EP-tagged, covering all
  7 in-scope journeys) with an RTM, and 6 bug reports with severity/priority/life-cycle state —
  two of them (BUG-01 transfer overdraft, BUG-02 negative bill-pay) are real financial-integrity
  defects reproduced live and still open on the shared demo instance.
- **UI automation** (`src/pages/`, `tests/ui/`): a `BasePage`-rooted POM, one page object per
  screen, data-driven registration tests, and balance-asserting journeys for account overview,
  open-account, transfer, bill pay, and find-transactions — including negative cases that
  deliberately track BUG-01/BUG-02/BUG-04 so a future fix would flip a named test, not just "make
  something pass."
- **API automation** (`src/core/ParaBankApiClient.ts`, `tests/api/`): a typed REST client covering
  login, customer/account lookups, account creation, transfers, and transaction search, plus a
  Postman collection (`api/postman/`) with the same coverage and inline notes on two endpoint
  shapes that aren't what the rest of the API would suggest. One hybrid test seeds an account via
  the API and verifies it through the UI overview page in the same test.
- **SQL data validation** (`sql/`, `src/data/db.ts`, `tests/sql/`): a small seeded schema
  (customers/accounts/transactions) with `BankDatabase` methods demonstrating SELECT+WHERE, a
  ranged WHERE, a JOIN, and a JOIN+GROUP BY, each asserted from a Playwright test — including one
  test that independently recomputes the expected aggregate in TypeScript rather than trusting the
  SQL sum at face value.
- **CI/CD** (`.github/workflows/ci.yml`): lint → typecheck → the full suite (UI + API + SQL, the
  SQL database reseeded automatically via `globalSetup`) on every push/PR to `main`, with the
  Playwright HTML report published as a build artifact.

## Coverage summary

| Layer | Count | Notes |
|---|---|---|
| Manual test cases | 69 | BVA/EP explicit on registration + transfer-amount fields |
| Bug reports | 6 | 2 Critical/P1, 1 High/P2, 2 Medium, 1 Low |
| UI automated tests | 24 | across registration/login, accounts, transfer/bill-pay, find-transactions (incl. 2 smoke) |
| API automated tests | 12 | accounts/login, create-account/transfer, transaction search, 1 hybrid (incl. 1 smoke) |
| SQL automated tests | 4 | WHERE, ranged WHERE, JOIN, JOIN+GROUP BY |
| **Total automated tests** | **40** | across 11 spec files, all green locally against the live app |
| Postman requests | 12 | mirrors the API suite's coverage, runnable via Newman in CI if desired |

All training-plan topics in the brief's coverage matrix have a corresponding artifact in the repo
(see `README.md`'s links); the RTM currently traces manual UI test cases only — it does not yet
have rows for the Sprint 4 API/SQL tests (see "with more time," below).

## What I'd do with more time

1. **Extend the RTM** to trace requirements through to the API and SQL automated tests too, not
   just the manual/UI test cases — right now those two layers are covered but not formally linked
   back to a requirement ID.
2. **Fix root causes, not just document them.** BUG-01/BUG-02 are real, reproduced defects; with
   write access to the app I'd rather have proposed the actual server-side balance/amount
   validation than only have a regression test tracking the bug.
3. **Cross-browser + sharding**, per the stretch goals — the suite currently runs Chromium-only,
   single-worker, specifically to avoid tripping ParaBank's shared-instance rate limit. A
   dedicated (non-shared) test environment would remove that constraint entirely.

## Three biggest lessons

1. **A plausible-looking API guess is still a guess.** The `createAccount` endpoint's real shape
   (`POST /createAccount?customerId=&newAccountType=&fromAccountId=`) contradicted the pattern
   every other `/accounts` endpoint follows. Confirming each endpoint against the live service
   with `curl` before writing a single client method or Postman assertion caught this — and a
   second, similar wrong guess about transaction lookup — before either shipped. See
   `docs/ai-usage-log.md` for the full trail.
2. **Shared public test infrastructure has its own failure mode, separate from the app under
   test.** ParaBank's demo instance rate-limits/cools down under bursty traffic regardless of what
   the requests are doing — discovered independently in Sprint 3 (UI) and again in Sprint 4 (API/
   Postman verification). Treating "this endpoint suddenly failed" as ambiguous between "the code
   is wrong" and "the shared instance is unhappy right now" — and re-testing before concluding
   either — mattered more than getting either layer's code right on the first try.
3. **Async side effects need polling, not a single assertion.** ParaBank's account-creation
   endpoint returns the new account with `balance: 0`; the $100 opening deposit lands moments
   later via an internal transfer. An assertion written against the immediate response would be
   flaky by construction — `expect.poll(...)` on the account's balance, not a single `expect`,
   is what makes `tests/api/create-account-transfer.spec.ts` and the hybrid test reliable.
