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
