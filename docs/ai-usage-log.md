# AI Usage Log

Claude Code (Anthropic) was used throughout this capstone as a pairing tool — scaffolding
structure, drafting code/docs, and researching the ParaBank REST API — with every non-trivial
output checked against either the live application, a local test run, or both before being kept.
This log records the meaningful uses, organised by sprint, with what was accepted, what was
changed, and how each was verified.

## Sprint 0–2 (Setup, Manual QA, Framework Foundation)

- **Task:** Scaffold the TypeScript/Playwright/ESLint/Prettier tooling and the initial folder
  structure (`src/core`, `src/pages`, `src/data`, `src/utils`).
  **Accepted:** the structure as proposed, matching the project brief's expected layout.
  **Verified:** `npm install` + `npx tsc --noEmit` ran clean; a smoke test executed against the
  live app before building further on top of it.

- **Task:** Draft `BasePage`, the `Logger`, and the environment `config` module.
  **Accepted:** the OOP shape (abstract `path`, shared `click`/`fill`/`waitForVisible` helpers) and
  the env-driven config with `qa`/`staging`/`local` defaults.
  **Verified:** exercised by the first two page objects (`LoginPage`, `RegisterPage`) and the smoke
  tests; the `baseURL` trailing-slash requirement (documented in `config.ts`) was found by an
  actual failed navigation, not predicted in advance — logged in `docs/agile/standup.md` (Day 2).

- **Task:** Draft the manual test plan, 69 test cases (BVA/EP-tagged), and the RTM.
  **Accepted:** the STLC-mapped structure and the bulk of the positive/negative cases.
  **Rejected/adjusted:** several first-draft cases assumed validation behaviour (e.g. a balance
  check on Transfer Funds, a rejected negative Bill Pay amount) that the live app does not actually
  enforce — these became BUG-01/BUG-02 instead of passing test cases once run against the real
  instance.
  **Verified:** every bug report in `docs/bug-reports.md` was manually reproduced against
  `https://parabank.parasoft.com` before being written down.

## Sprint 3 (UI Automation)

- **Task:** Build out the remaining page objects and data-driven UI specs (registration/login,
  account management, transfer/bill-pay, find-transactions).
  **Accepted:** the POM structure and most locator choices.
  **Verified:** every spec run locally against the live app (`npx playwright test tests/ui`) before
  commit; flakiness from ParaBank's shared-instance rate limiting was diagnosed by re-running
  failures in isolation, not assumed — leading to the `requestPacing` fixture and the single-worker
  config, both documented inline where they're defined.

## Sprint 4 (API & Data)

- **Task:** Design the `ParaBankApiClient` wrapper and the automated API test suite.
  **First draft (wrong):** assumed `createAccount` followed the same resource shape as the rest of
  `/accounts` — i.e. `POST /accounts/{customerId}/{newAccountType}/{fromAccountId}` — by pattern-
  matching against `GET /accounts/{id}` and `GET /customers/{id}/accounts`. This is plausible-
  looking but wrong: ParaBank's actual `createAccount` endpoint is `POST /createAccount` with
  `customerId`/`newAccountType`/`fromAccountId` as **query parameters**, not path segments.
  **How it was caught:** rather than trust the guess, every endpoint was probed against the live
  service with `curl` before being written into the client or the Postman collection. The
  path-segment version returned `404 Not Found`; the query-param version returned `200 OK` with the
  new account's JSON. Same process caught a second wrong assumption — that "find transaction by
  id" is scoped under `/accounts/{accountId}/transactions/{transactionId}` (it isn't; that path
  404s even for a transaction that really does belong to that account — the real endpoint is the
  unscoped `/transactions/{transactionId}`).
  **Accepted:** the corrected client, with both quirks documented inline (`ParaBankApiClient.ts`)
  and in the Postman collection's request descriptions, so the next person doesn't repeat the same
  wrong guess.
  **Verified:** `npx playwright test tests/api` green locally, plus the same collection re-run
  through `newman` (`npx newman run api/postman/ParaBank.postman_collection.json -e
  api/postman/ParaBank.postman_environment.json`) to confirm the Postman assertions and the
  Playwright assertions agree on the same live responses.

- **Task:** Draft the SQL schema, seed data, and `BankDatabase` query module.
  **Accepted:** the schema and the four query methods (WHERE, ranged WHERE, JOIN, JOIN+GROUP BY)
  largely as drafted.
  **Verified:** rather than trust the generated `GROUP BY` total, `tests/sql/data-validation.spec.ts`
  independently recomputes each customer's expected total by summing `getAccountsForCustomer()` in
  TypeScript and compares it against `getCustomerBalanceSummary()`'s SQL-side sum — so a future
  schema/query change that silently breaks the aggregation would be caught by the cross-check, not
  just by the query "looking right".

- **Operational note (not a code defect, but worth recording):** while manually re-verifying the
  Postman collection with `newman` right after building it, rapid back-to-back requests from this
  session's own IP tripped the same multi-minute rate-limit/cooldown on ParaBank's shared demo
  instance that Sprint 3 had already documented for CI. One request (`Login - valid credentials`)
  failed mid-verification even though the identical request had returned `200 OK` minutes earlier.
  Re-confirmed by waiting and re-running rather than assuming the collection itself was wrong —
  a reminder that "the AI's output was right the first time" and "the live shared instance is
  temporarily unhappy" can look identical from a single failed run, and only re-testing tells them
  apart.

## Sprint 5 (CI/CD, Reporting, Polish)

- **Task:** Extend `.github/workflows/ci.yml` and add `globalSetup` for the SQL seed step.
  **Accepted:** running `sql/seed.js` via `globalSetup` (so every `npm test`/`npm run test:*`
  invocation — locally or in CI — reseeds the database automatically, with no separate CI step to
  forget).
  **Verified:** `npx playwright test tests/sql` and a full local `npm test` run both confirmed the
  database exists and is freshly seeded before the suite starts.
