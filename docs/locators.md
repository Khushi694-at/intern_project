# Locator Strategy

All locators live inside page objects (`src/pages/`) — test files never reference a selector
directly. This doc records the priority order used when choosing a locator and where/why the
codebase falls back to a lower-priority strategy.

## Priority order

1. **Role + accessible name** — `page.getByRole('link', { name: 'Register' })`. Survives markup
   changes, DOM reordering, and (crucially on ParaBank) URL rewriting.
2. **Stable `id`/`name` attribute** — `page.locator('#accountTable')`, `input[name="username"]`.
   Used wherever ParaBank's markup exposes no accessible role but does expose a stable,
   non-generated id — these ids are part of ParaBank's own JS (onclick handlers, AJAX targets),
   so they're as unlikely to change as the feature itself.
3. **Attribute-scoped CSS** — `input[type="submit"][value="Transfer"]`. Only used for legacy
   `<input type="button">`/`<input type="submit">` elements ParaBank renders with no `id`, `name`,
   or accessible role at all. Scoped to type + visible value, not a bare tag or class.
4. **Filtered/relational locators** — `rows.filter({ has: page.locator('a', { hasText: accountId }) })`
   in `OverviewPage`. Finds "the row for this account" by content, not by row index — resilient to
   ParaBank re-ordering the account table (which it does: newest account first).

## Explicitly avoided

- **Absolute/deep XPath** (`//div[3]/table/tbody/tr[2]/td[1]`) — breaks on any layout change and
  encodes no intent. Not used anywhere in this codebase.
- **Index-based CSS** (`tr:nth-child(4)`, `.btn:nth-of-type(2)`) — same fragility as absolute
  XPath, just shorter. Where a specific row/element must be picked out of a set (see
  `FindTransactionsPage.resultRows`, `OverviewPage.rows`), it's selected by content or by a
  stable container id, never by position.
- **`page.waitForTimeout()` / fixed sleeps** — every wait in the framework is either Playwright's
  auto-waiting (built into `locator.click()`/`.fill()`) or an explicit `expect(locator).toBeVisible()`
  / `.toBeAttached()` for content that loads asynchronously (e.g. `OverviewPage.waitForAccountsLoaded()`,
  the AJAX-populated account dropdowns in `OpenAccountPage`/`TransferFundsPage`). The one deliberate
  exception is `requestPacing` in `src/core/fixtures.ts` / `src/core/request-pacing.ts` — a fixed
  delay *between tests in CI*, to stay under ParaBank's rate limit. That is a network-pacing
  measure, not a wait for UI/app state, and is called out as such in its own comment.

## Why ParaBank forces some CSS/id use

ParaBank's markup predates modern accessibility conventions: form inputs are plain
`<input type="button">` elements with no `role="button"` semantics beyond what the browser infers,
and most interactive elements carry an `id` (`#type`, `#fromAccountId`, `#amount`) that Playwright's
role locators can't target directly. Where an accessible role/label genuinely exists (navigation
links, headings), the page objects use it (`getByRole('link', { name: 'Log Out' })`,
`registerPage.heading`). Where it doesn't, the id/name/value the app itself relies on for its own
JavaScript is the next-most-stable thing to key off — never a positional or generated selector.

## Applies the same way to API assertions

The same "assert on stable identity, not position" principle carries over to the API/SQL suites:
`tests/api/*.spec.ts` matches transactions by amount/id (never "the Nth item in the array"), and
`src/data/db.ts`'s queries filter by `customer_id`/`account_id`, not row order.
