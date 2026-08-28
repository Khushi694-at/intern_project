# Bug Reports — ParaBank Manual Test Pass (Sprint 1)

**Application Under Test:** ParaBank — https://parabank.parasoft.com/parabank/index.htm
**Test account used:** `sdettester0826a` (checking account #26997, savings account #27330)
**Date found:** 2026-08-26
**Found by:** SDET Intern, manual exploratory + negative testing

All defects below were reproduced live against the public ParaBank demo instance and are tied back to their originating test case in `test-cases.xlsx`.

## BUG-01 — Transfer Funds allows transferring more than the account's available balance

- **Severity:** Critical
- **Priority:** P1
- **Related test case:** TC038
- **Life-cycle state:** New (open)

**Steps to reproduce:**
1. Log in as a customer who owns two accounts (e.g. checking #26997 with balance $415.50, savings #27330).
2. Go to Transfer Funds.
3. Enter an amount far exceeding the From account's balance (e.g. $999,999.00).
4. Select From = #26997, To = #27330.
5. Click Transfer.

**Expected result:** The transfer is rejected with an "insufficient funds" style validation error, and neither account balance changes.

**Actual result:** The application shows "Transfer Complete! $999999.00 has been transferred from account #26997 to account #27330." Checking the Accounts Overview afterward confirms account #26997's balance is now -$999,583.50 (a negative balance), while #27330 shows $1,000,099.00. There is no server-side balance check on the transfer amount at all.

**Why severity/priority differ:** Rated Critical because it is a core financial-integrity defect (a banking app must never let a transfer drive a balance negative without an overdraft product backing it) with a trivial, 100%-reproducible repro path; P1 because it blocks trustworthy use of the single most central feature of a banking app (moving money) and should be fixed before any other Transfer Funds work continues.

## BUG-02 — Bill Pay accepts a negative payment amount and processes it as a successful credit

- **Severity:** Critical
- **Priority:** P1
- **Related test case:** N/A — found via exploratory testing. The current test-cases.xlsx has BVA cases for a $0 Bill Pay amount (TC052) and an over-balance amount (TC053), but no dedicated negative-amount case; adding one (mirroring TC040, the equivalent Transfer Funds case) is a good candidate for Sprint 3.
- **Life-cycle state:** New (open)

**Steps to reproduce:**
1. Log in and go to Bill Pay.
2. Fill in valid payee details (name, address, city, state, zip, phone).
3. Enter Account # and Verify Account # as the same valid account (e.g. #26997).
4. Enter Amount = -50.
5. Click Send Payment.

**Expected result:** The amount field should reject a negative number as invalid; no payment should be processed.

**Actual result:** The application shows "Bill Payment to Electric Co in the amount of $-50.00 from account 26997 was successful." A negative "bill payment" effectively deposits money into the paying account rather than being rejected — the reverse of what Bill Pay is meant to do.

**Why severity/priority differ:** Rated Critical/P1 for the same reason as BUG-01 — it is a financial-correctness defect that lets a user manufacture funds through a supposedly outbound-only payment flow, with a simple, always-reproducible repro path.

## BUG-03 — Update Contact Info accepts non-numeric Zip Code and Phone # values with no format validation

- **Severity:** Medium
- **Priority:** P2
- **Related test case:** TC067 (Zip Code format on update). No dedicated case exists yet for an invalid Phone # format on the update-profile screen specifically (only on registration, TC017) — a good candidate addition for Sprint 3.
- **Life-cycle state:** New (open)

**Steps to reproduce:**
1. Log in and go to Update Contact Info.
2. Change Zip Code to `ABCDE` (letters).
3. Change Phone # to `phone-abc` (letters and a dash).
4. Click Update Profile.

**Expected result:** The form should reject non-numeric values in Zip Code and Phone # with an inline validation message, since both are numeric-format fields elsewhere in the app (e.g. registration).

**Actual result:** The page shows "Profile Updated — Your updated address and phone number have been added to the system," and the invalid values are saved and redisplayed on the profile.

**Why severity/priority differ:** Rated Medium because it is a data-quality/format-validation gap rather than a financial-correctness or security issue — it corrupts stored contact data (which could later break downstream features like SMS/mail notifications) but has no direct monetary impact; P2 because it should be fixed soon but does not block other functionality.

## BUG-04 — Find Transactions by Transaction ID throws an unhandled internal error for a non-existent ID

- **Severity:** High
- **Priority:** P2
- **Related test case:** TC060
- **Life-cycle state:** New (open)

**Steps to reproduce:**
1. Log in and go to Find Transactions.
2. Enter a Transaction ID that does not exist on the account (e.g. 999999999).
3. Click Find Transactions.

**Expected result:** A friendly message such as "No transaction found for that ID" should be shown.

**Actual result:** The application shows a generic error page: "Error! An internal error has occurred and has been logged." This is an unhandled server-side exception surfaced directly to the end user rather than a graceful validation/empty-result message, and the wording ("has been logged") suggests this is hitting a real exception handler rather than an intentional "not found" state.

**Why severity/priority differ:** Rated High rather than Critical because it does not corrupt data or move money, but it is an unhandled-exception path reachable by any logged-in user typing an arbitrary number into a search box — the kind of defect that, in a real banking backend, often correlates with unvalidated input reaching a data layer; P2 to fix soon and add a regression test once the root cause is triaged.

## BUG-05 — Registering with a duplicate username silently clears the entire form with no error message

- **Severity:** Medium
- **Priority:** P3
- **Related test case:** TC014
- **Life-cycle state:** New (open)

**Steps to reproduce:**
1. Register a customer with username `sdettester0826a` (succeeds).
2. Go to Register again.
3. Fill in a different person's full details, but reuse username `sdettester0826a`.
4. Click Register.

**Expected result:** An inline error such as "This username already exists." should be shown, with the rest of the form's values retained so the user only has to change the username.

**Actual result:** The page reloads a completely blank registration form — every field the user typed (name, address, zip, phone, SSN, password) is discarded — with no error message anywhere on the page explaining why registration did not succeed. A user would have no way to know the problem was specifically the username, and has to re-enter all ~11 fields from scratch.

**Why severity/priority differ:** Rated Medium because it blocks account creation with zero feedback (a real usability/support-load problem) but has no data-integrity or financial impact; P3 because a workaround exists (pick a different username and try again) even though the experience is poor.

## BUG-06 — Apply for a Loan silently discards non-numeric Loan Amount / Down Payment input with no validation message

- **Severity:** Low
- **Priority:** P3
- **Related test case:** N/A — found via exploratory testing of the Request Loan feature while probing input-validation behavior; Request Loan is not one of the seven in-scope journeys, so no formal test case was written for it, but the defect is recorded here per the Definition of Done's ≥6-bug requirement.
- **Life-cycle state:** New (open)

**Steps to reproduce:**
1. Log in and go to Request Loan.
2. Enter Loan Amount = `abc`.
3. Enter Down Payment = `xyz`.
4. Click Apply Now.

**Expected result:** An inline validation message should explain that Loan Amount and Down Payment must be numeric.

**Actual result:** The form silently resets both fields to blank with no error message at all. The user is left unsure whether the request was submitted, rejected, or simply cleared.

**Why severity/priority differ:** Rated Low/P3 because Loan Amount/Down Payment are speculative inputs with no immediate financial or data-integrity consequence (unlike BUG-01/BUG-02), but the missing feedback is a real usability defect worth fixing alongside BUG-05, since both share the same root pattern: silent form-clearing instead of a validation message.

## Summary table

| ID | Title | Severity | Priority | State |
|---|---|---|---|---|
| BUG-01 | Transfer Funds allows overdrawing an account with no balance check | Critical | P1 | New |
| BUG-02 | Bill Pay accepts a negative amount and credits the payer | Critical | P1 | New |
| BUG-03 | Update Contact Info accepts invalid Zip Code / Phone # formats | Medium | P2 | New |
| BUG-04 | Find Transactions by ID throws an unhandled internal error | High | P2 | New |
| BUG-05 | Duplicate-username registration silently wipes the form | Medium | P3 | New |
| BUG-06 | Apply for a Loan silently discards non-numeric input | Low | P3 | New |
