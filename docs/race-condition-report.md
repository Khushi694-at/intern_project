# Race Condition Report — ParaBank Transfer Funds Service

**Application Under Test:** ParaBank — https://parabank.parasoft.com/parabank/index.htm
**Test type:** Concurrency / race-condition testing (automated)
**Automated test:** `tests/api/race-condition.spec.ts`
**Test accounts used:** Two throwaway CHECKING accounts created per run under the shared demo customer #12212 (John Smith), each funded via the customer's own SAVINGS account #13344
**Date found:** 2026-09-17

This is a companion to `docs/bug-reports.md`. That pass covered validation bugs found by driving the app sequentially, one request at a time. This one asks a different question: what happens when the same account is hit by several requests *at once*? The finding below was reproduced twice, live, against the public demo instance, before being written down.

## RACE-01 — Concurrent transfers from the same account lose debits (lost-update race)

- **Severity:** Critical
- **Priority:** P1
- **Related automated test:** `tests/api/race-condition.spec.ts`
- **Life-cycle state:** New

**Steps to reproduce:**
1. Create two fresh CHECKING accounts, A and B, owned by the same customer, each seeded with the standard $100 opening deposit.
2. Fire 15 `POST /transfer?fromAccountId=A&toAccountId=B&amount=20` requests **at the same instant**, with no delay or sequencing between them (`Promise.all` over 15 concurrent calls).
3. Confirm every one of the 15 responses is `200 OK` — ParaBank never rejects any of them.
4. After a short settle time, `GET` both accounts' final balances.

**Expected result:** Every accepted transfer debits A and credits B by the same $20. With 15 accepted transfers, A should end at `100 - (15 × 20) = -200` and B should end at `100 + (15 × 20) = 400` (A going negative is the separate, already-tracked BUG-01 — not the point of this test). Both sides of the ledger should reconcile: total debited from A should equal total credited to B.

**Actual result — three single-burst attempts at 15 concurrent transfers each:**

| Attempt | Expected debit/credit | Actual debit from A | Actual credit to B | Debits lost |
|---|---|---|---|---|
| 1 | $300 | $260 (A → **-$160**) | $300 (B → $400) ✅ | 2 of 15 |
| 2 | $300 | $240 (A → **-$140**) | $300 (B → $400) ✅ | 3 of 15 |
| 3 | $300 | $300 (A → -$200) ✅ | $300 (B → $400) ✅ | 0 of 15 (no race this time) |

Attempts 1 and 2 (2 of 3) show B credited the full, correct amount, while A is **not** debited the full amount, even though all 15 requests individually reported success ("Successfully transferred $20.00..."). Attempt 3 landed clean, with every debit and credit applying correctly — confirming this is a genuinely timing-dependent race rather than a deterministic bug: the same 15-concurrent-request burst does not reproduce it every single time.

This is a textbook lost-update / TOCTOU (time-of-check-to-time-of-use) race: the transfer service reads an account's current balance, computes the new value in application code, and writes it back in a separate step. When two requests for the same account overlap, both read the same starting balance; whichever write lands second overwrites the first's debit instead of stacking on top of it. The credit side to B never showed the symptom across all three attempts, which suggests each concurrent credit is landing on a distinct-enough read of B's balance to avoid colliding with another concurrent credit — B in this test is only ever a destination, never a source, in the same window.

**Concurrency threshold and reliability:** Not reproducible at 5 concurrent transfers of the same amount — both accounts landed on the exact expected balance every time tried. At 15 concurrent transfers, the race reproduced in 2 of 3 single-burst attempts (~67% hit rate in this sample). Because a single burst isn't guaranteed to land in the race window, the automated test (`tests/api/race-condition.spec.ts`) repeats the 15-concurrent-transfer burst 3 times against fresh accounts within one test run and asserts that **at least one** of the 3 rounds shows a lost update — trading a small amount of runtime for a much lower chance of a false "no race" result. It still asserts the *direction* of the discrepancy (source keeps more than expected) rather than an exact lost-update count, since the count varies attempt to attempt.

**Impact:** Money is effectively created in the paying customer's favor — the source account is short-debited relative to what actually left it, with no matching shortfall on the receiving side. In a real banking system, a balance-integrity bug that appears specifically under concurrent load (e.g. a customer double-tapping "Transfer", or multiple browser tabs/devices, or — more seriously — a scripted attack sending deliberate bursts) would be a critical financial-integrity defect, independent of and more severe than a missing input-validation check.

**Suggested fix:** Make the balance decrement atomic at the point of write rather than a read-then-write pair in application code — e.g. a single `UPDATE accounts SET balance = balance - :amount WHERE id = :id` statement, or a `SELECT ... FOR UPDATE` row lock held across the read and the write for that account.

## Methodology & environment notes

- **Harness:** Playwright's `APIRequestContext` via the existing `apiClient` fixture (`src/core/api-fixtures.ts`); `Promise.all` over N `apiClient.transfer(...)` calls with no artificial delay between them, so the requests leave the client back-to-back on the same connection pool.
- **Isolation:** A fresh pair of accounts is created per run rather than reusing the shared demo account other UI/API suites assert against (`SOURCE_ACCOUNT_ID` in `tests/api/create-account-transfer.spec.ts`), so a lost update here can't be caused by, or mistaken for, interference from another spec.
- **Rate limiting:** ParaBank's shared public demo instance is fronted by Cloudflare and returns error 1015 (rate limited) when a burst of concurrent requests arrives as many separate OS-level connections — observed while probing manually with 20 parallel `curl` processes, consistent with the sequential-request rate limiting already documented in `docs/ai-usage-log.md`. Firing the same burst through Playwright's pooled `APIRequestContext` (fewer, reused connections) did not trip this at 15 concurrent requests, which is why the automated test uses that count.
- **Shared-instance drift:** Account IDs created during manual `curl` probing became unreachable (`Could not find account #...`) a few minutes later, and a later-created account ID was found reassigned to a different customer than the one that created it. The public demo instance's seed data appears to reset independently of anything this suite does — a reason the automated test always creates its own accounts fresh rather than hardcoding IDs, and a limit on how far this investigation could be pushed on a shared, uncontrolled environment.

## What I'd do with more time

1. **Sweep the concurrency threshold.** Only "no" at 5 and "~67% yes" at 15 were tested; narrowing the range (6 through 14) would find where the hit rate starts climbing above 0%.
2. **Test the credit side too.** This report only exercised concurrent *debits* against one source account. Running the mirror case — many concurrent transfers from different sources into the *same* destination — would show whether credits are equally exposed to a lost update or whether the asymmetry seen here (credits always landed correctly) holds up.
3. **Run against a dedicated instance.** The shared public demo's rate limiting and periodic data resets cap how high the concurrency (and therefore confidence in the exact failure rate) can be pushed. A private/local ParaBank deployment would allow testing at 50–100+ concurrent requests without those constraints.
