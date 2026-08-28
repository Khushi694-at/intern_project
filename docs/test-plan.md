# Test Plan — ParaBank Online Banking Application

**Project:** SDET Intern Project — Sprint 1 (Manual QA & Test Design)
**Application Under Test (AUT):** ParaBank — https://parabank.parasoft.com/parabank/index.htm
**Fallback AUT (if ParaBank unavailable):** SauceDemo (UI) — https://www.saucedemo.com; restful-booker / reqres.in (API)
**Date:** 2026-08-26
**Sprint:** Sprint 1 of 6 (Days 1–2 of a 10-day plan)

## 1. Scope

### 1.1 Objective

Validate the core customer-facing journeys of ParaBank — a free, publicly hosted demo online-banking application — through manual testing, and produce the artifacts (test plan, ≥40 test cases, a Requirement Traceability Matrix, and ≥6 logged bug reports) that will seed the automated UI/API/SQL suites built in later sprints.

### 1.2 In scope — journeys under test

| # | Journey |
|---|---|
| R1 | Register a new customer and log in / log out |
| R2 | View the Accounts Overview and account details |
| R3 | Open a new account (savings / checking) and confirm it appears with the correct opening balance |
| R4 | Transfer funds between two accounts and verify both balances change correctly |
| R5 | Pay a bill and verify the transaction and resulting balance |
| R6 | Find transactions (by amount / by date) and verify results |
| R7 | Update customer contact details |

Performance, load, and security testing are explicitly **out of scope** (see Risks, Section 4) — the app is treated as a black box, exercised only through its UI and API.

## 2. Test Strategy

### 2.1 Test types selected

| Test type | Why it's used |
|---|---|
| Functional / black-box testing | The primary technique for this sprint — validates each in-scope journey behaves per expected banking behavior (registration, login, transfers, bill pay, search, profile update) without inspecting source code. |
| Positive testing | Confirms each journey works correctly with valid data (e.g., a well-formed transfer between two owned accounts). Establishes the "happy path" baseline that Sprint 3's automation will encode first. |
| Negative testing | Confirms the application rejects or safely handles invalid input (e.g., a transfer larger than the available balance, a non-numeric zip code). This sprint's manual pass found that ParaBank does not always do this safely — see Section 4, Risks. |
| Boundary Value Analysis (BVA) | Applied explicitly to the registration form and the transfer-amount field, where numeric/format boundaries (minimum length, $0.01, available-balance boundary) are the highest-risk area for off-by-one and missing-validation defects. |
| Equivalence Partitioning (EP) | Applied explicitly to the same two areas, to reduce the registration and transfer-amount input space to representative classes (valid, empty, too-long, wrong-format, negative, zero, over-balance) without testing every possible value. |
| Exploratory testing | A short unscripted pass across all seven journeys, used to surface the defects that scripted cases might not anticipate (this is how BUG-04 and BUG-05 were found). |

### 2.2 STLC phases followed this sprint

1. **Requirement Analysis** — read the project brief and ParaBank's live registration/account/transfer/bill-pay/search/profile screens to confirm actual field names, labels, and behavior match the stated requirements (Section 1.2).
2. **Test Planning** — this document: scope, strategy, environment, risks, entry/exit criteria.
3. **Test Case Design** — ≥40 test cases written to `test-cases.xlsx`, covering positive and negative paths with BVA/EP tags where applicable; the Requirement Traceability Matrix (RTM) maps each requirement to its test cases.
4. **Test Environment Setup** — a fresh ParaBank customer (`sdettester0826a`) and two accounts (one checking, one savings) were created live on the public demo instance for this pass; no local environment setup was required since ParaBank is a hosted demo app.
5. **Test Execution** — a first manual pass was executed against the live application (not just designed on paper): every in-scope journey was exercised at least once, and the negative/BVA/EP cases around registration, transfer, bill pay, search, and profile update were actively probed.
6. **Defect Reporting** — 6 defects found during execution were logged to `bug-reports.md` with severity, priority, repro steps, expected vs. actual result, and life-cycle state.
7. **Test Closure** (end of sprint) — exit criteria in Section 5 checked; carry-over items and known gaps recorded for later sprints.

### 2.3 Test techniques quick-reference (used in `test-cases.xlsx`)

- **Positive / Negative** — whether the case supplies valid or invalid data.
- **BVA** — Boundary Value Analysis (tests values at/near a boundary: min length, $0.00, $0.01, exact balance, balance + $0.01).
- **EP** — Equivalence Partitioning (tests one representative value per input class: valid, empty, too-long, non-numeric, negative, zero).

## 3. Test Environment

| Item | Detail |
|---|---|
| Application URL | https://parabank.parasoft.com/parabank/index.htm |
| Environment type | Shared public demo instance (Parasoft-hosted) — not a dedicated QA environment; data persists across sessions and is visible to other testers worldwide |
| Browser(s) | Chrome (latest) |
| Test account(s) created | Username `sdettester0826a`; Checking account (opening balance $515.50, later corrupted by BUG-01 — see bug reports); Savings account opened with $100 minimum funding |
| Test data strategy | Synthetic data only (fictitious name, address, phone, SSN placeholder) — no real PII is used against the public demo instance |
| Fallback environment | If ParaBank is unavailable: SauceDemo (UI) at https://www.saucedemo.com, restful-booker or reqres.in (API) — same test structure, different pages/endpoints |

### 3.1 Data needs

- At least one funded checking account and one funded savings account belonging to the same customer, to exercise cross-account transfers (R4) and the account-opening funding flow (R3).
- At least one bill payee (synthetic business name/address/phone/account number) to exercise Bill Pay (R5).
- At least one prior transaction (created by R3–R5 above) to exercise Find Transactions (R6).

## 4. Risks & Assumptions

### 4.1 Risks

| Risk | Impact | Mitigation this sprint |
|---|---|---|
| Public shared demo environment — state can be altered by other testers worldwide, or reset without notice | Medium — a test run may see unexpected balances/accounts from other users, or lose test data | Tests use a freshly registered, uniquely named test user rather than a shared/well-known login; account numbers and balances are captured at time of test rather than assumed |
| No performance/load testing this sprint | Medium — the app's behavior under concurrent load or large data volumes is unknown | Explicitly out of scope per the project brief; flagged here rather than silently skipped |
| No security testing this sprint | High (long-term) — a live money-movement app was found to have functional defects with clear security implications (see BUG-01, BUG-02) but no dedicated security pass (auth bypass, injection, session handling) was performed | Flagged as a residual risk and as follow-up scope; the two functional defects found are logged as bugs, not "resolved" via testing |
| The demo app is a real, internet-facing system | Low–Medium | Only synthetic test data was used; no real personal or financial information was entered |
| Confirmed data-integrity defects (BUG-01, BUG-02) mean this sprint's own test account now holds an invalid negative balance | Low (test-only) | Documented in the bug reports rather than silently worked around; a fresh account should be used for later automation baselines |

### 4.2 Assumptions

- ParaBank's publicly documented REST API and page structure are stable enough to design against for this sprint and for the automation work in later sprints.
- "Positive/Negative" and "in/out of scope" classifications follow the project brief exactly; no additional journeys (e.g., Apply for a Loan, Admin Page) are formally in scope for Sprint 1.
- The grader/reviewer has independent access to the same public ParaBank instance to reproduce results.

## 5. Entry / Exit Criteria

### 5.1 Entry criteria (must be true before test execution starts)

- Project brief reviewed and in-scope/out-of-scope journeys confirmed against the live application's actual navigation menu.
- A test account can be created via the public Register page.
- Test environment (ParaBank URL) is reachable and returns the expected login page.

### 5.2 Exit criteria (must be true before Sprint 1 is called done)

- Test plan (`test-plan.md`) covers scope, strategy, STLC, environment, risks, entry/exit criteria.
- ≥40 test cases written in `test-cases.xlsx` covering all 7 in-scope journeys, with BVA and EP explicitly shown on the registration and transfer-amount fields.
- Requirement Traceability Matrix (`test-cases.xlsx`, Requirements sheet) maps every requirement (R1–R27) to at least one test case.
- A first manual pass has been executed against the live application (not just designed on paper).
- ≥6 bugs logged in `bug-reports.md` with severity, priority, repro steps, expected vs. actual, and life-cycle state.

## 6. Deliverables produced this sprint

| File | Contents |
|---|---|
| `docs/test-plan.md` | This document |
| `docs/test-cases.xlsx` — sheet **Test Cases** | 69 test cases: ID, requirement, title, precondition, steps, test data, expected result, type, technique tag |
| `docs/test-cases.xlsx` — sheet **Requirements** | Requirement → test case(s) → automated-test placeholder mapping (the RTM) |
| `docs/test-cases.xlsx` — sheet **Summary** | Totals: test case count, positive/negative split, BVA/EP usage, requirements covered |
| `docs/bug-reports.md` | 6 defects found during manual execution, each with severity/priority/repro/expected-vs-actual/life-cycle state |
