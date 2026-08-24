# ParaBank Exploration Notes (Day 1)

Manual, hand-driven walkthrough of every in-scope journey, done to inform the test plan, the
page-object design, and the API/SQL work in later sprints.

**Test user registered:** `sdet_khushi_0824` (Bengaluru, KA — fictional test data only).

## Flows walked

| Flow | URL | Observation |
|---|---|---|
| Register | `/parabank/register.htm` | 9 required fields + username/password/confirm. On success, auto-logs in **and auto-opens a CHECKING account** with a seeded starting balance. |
| Login / Logout | `/parabank/index.htm` | Simple username/password form. Session tracked via `jsessionid` in the URL. |
| Accounts Overview | `/parabank/overview.htm` | Lists every account with Balance and Available Amount; a totals row sums all balances. |
| Open New Account | `/parabank/openaccount.htm` | Dropdown (CHECKING/SAVINGS) + a dropdown to pick the funding account. **No amount input field exists in the UI** despite the on-page copy ("a minimum of $100.00 must be deposited") — it silently moves a fixed $100 from the funding account. Worth a dedicated test + a bug note about the misleading copy. |
| Transfer Funds | `/parabank/transfer.htm` | Amount field + two account dropdowns (from/to). Confirmation page echoes amount and both account numbers. No visible cap on transferring more than the available balance was hit during exploration — flagged for a negative test in Sprint 1. |
| Bill Pay | `/parabank/billpay.htm` | Full payee form (name, address, city, state, zip, phone, account #, verify account #, amount, from-account). **All fields are required and validated client-side on submit** (a first attempt with only Payee Name + Amount filled surfaced 7 distinct "X is required" messages, plus an "account numbers do not match" check between Account # and Verify Account #). Good source of negative/EP test cases. |
| Find Transactions | `/parabank/findtrans.htm` | Four independent search modes: by Transaction ID, by Date (`MM-DD-YYYY`), by Date Range, by Amount. Account selector **defaults to the most recently opened account**, not the primary one — easy to miss when scripting. |
| Update Contact Info | `/parabank/updateprofile.htm` | Pre-filled with the registered profile; same field set as registration minus username/password. |

## REST API

- Base path: `/parabank/services/bank/` (confirmed via `GET /parabank/services/bank/accounts/{id}`).
- **Default response format is XML**, not JSON — Playwright's `request` context and Postman both need
  `Accept: application/json` set explicitly to get JSON back. Documenting this now so Sprint 4 doesn't lose time on it.
- Balance returned by the API matched the UI exactly after a transfer + a bill payment, confirming API and UI
  read from the same state (useful for the hybrid API-seeds/UI-verifies test).

## Quirks / risks to carry into the Test Plan

1. Open New Account's "$100 minimum" messaging is not backed by an actual input — the amount is fixed and
   implicit. Candidate bug report + explicit test asserting the exact transfer amount.
2. Transfer Funds did not visibly block an over-balance transfer during manual poking — needs a deliberate
   boundary test (transfer amount == balance, and amount > balance) in Sprint 1's manual pass.
3. Find Transactions' default account selection is stateful (last-opened, not primary) — automation must not
   assume a fixed default and should always select the account explicitly.
4. API responses default to XML — every Playwright/Postman request needs an explicit `Accept: application/json`
   header.
