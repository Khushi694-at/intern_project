import { test, expect } from '../../src/core/api-fixtures';
import type { ParaBankApiClient } from '../../src/core/ParaBankApiClient';
import type { ApiAccount } from '../../src/data/types';

const DEMO_CUSTOMER_ID = 12212;
// John's SAVINGS account on the shared demo instance — used only as the funding source for
// throwaway CHECKING accounts created below, never touched directly by this spec.
const FUNDING_ACCOUNT_ID = 13344;

const CONCURRENT_TRANSFERS = 15;
const AMOUNT_PER_TRANSFER = 20;
const EXPECTED_PER_ROUND = CONCURRENT_TRANSFERS * AMOUNT_PER_TRANSFER;
// A single burst of 15 concurrent transfers only won the timing window ~2 of 3 times when this
// was tried live (see docs/race-condition-report.md) — repeating the burst keeps the test from
// being flaky in the "no race observed" direction on a run where the timing happened to line up.
const ROUNDS = 3;

interface RoundResult {
  sourceId: number;
  destinationId: number;
  debited: number;
  credited: number;
}

async function pollOpeningDeposit(apiClient: ParaBankApiClient, accountId: number) {
  return expect
    .poll(
      async () => {
        const account = (await (await apiClient.getAccount(accountId)).json()) as ApiAccount;
        return account.balance;
      },
      { timeout: 10_000, message: `Waiting for account #${accountId}'s $100 opening deposit to land` },
    )
    .toBe(100);
}

async function createRaceAccount(apiClient: ParaBankApiClient): Promise<ApiAccount> {
  const created = (await (
    await apiClient.createAccount(DEMO_CUSTOMER_ID, 'CHECKING', FUNDING_ACCOUNT_ID)
  ).json()) as ApiAccount;
  await pollOpeningDeposit(apiClient, created.id);
  return created;
}

/**
 * Fires `CONCURRENT_TRANSFERS` transfers from a fresh source account into a fresh destination
 * account at the same instant, each one individually well within the source's balance. A
 * transfer service that correctly serializes "read balance -> subtract -> save" per account
 * (e.g. a DB row lock or an in-memory mutex keyed by account id) applies every transfer and
 * lands on an exact final balance. A service that reads/writes the balance non-atomically is
 * vulnerable to a classic TOCTOU lost-update race: two requests read the same starting balance,
 * and whichever write lands second overwrites the first's debit instead of stacking on top of
 * it — silently losing money from the ledger's point of view.
 *
 * Uses a fresh pair of accounts per round (rather than a suite-shared account) so a lost update
 * here can't be masked or caused by another spec touching the same balance.
 */
async function runRound(apiClient: ParaBankApiClient): Promise<RoundResult> {
  const source = await createRaceAccount(apiClient);
  const destination = await createRaceAccount(apiClient);

  const responses = await Promise.all(
    Array.from({ length: CONCURRENT_TRANSFERS }, () =>
      apiClient.transfer(source.id, destination.id, AMOUNT_PER_TRANSFER),
    ),
  );

  // Every individual request is accepted — ParaBank's transfer service never rejects a
  // concurrent request outright, which is what makes the underlying race observable at all.
  for (const response of responses) {
    expect(response.status()).toBe(200);
  }

  // Give the last write a moment to settle, then read once rather than expect.poll-ing toward
  // the "correct" value — if a lost update happened, the balance never reaches it, and we want
  // the actual (wrong) figure for the report rather than a timeout.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const finalSource = (await (await apiClient.getAccount(source.id)).json()) as ApiAccount;
  const finalDestination = (await (await apiClient.getAccount(destination.id)).json()) as ApiAccount;

  return {
    sourceId: source.id,
    destinationId: destination.id,
    debited: 100 - finalSource.balance,
    credited: finalDestination.balance - 100,
  };
}

test.describe('Race condition — concurrent transfers against a single account', () => {
  test('firing N concurrent transfers from one account loses updates instead of applying every debit, in at least one of several attempts', async ({
    apiClient,
  }) => {
    const results: RoundResult[] = [];
    for (let round = 1; round <= ROUNDS; round += 1) {
      results.push(await runRound(apiClient));
    }

    results.forEach((result, index) => {
      console.log(
        `[race-condition] round ${index + 1}/${ROUNDS}: expected $${EXPECTED_PER_ROUND} each | ` +
          `actual debit: $${result.debited} (source #${result.sourceId}) | ` +
          `actual credit: $${result.credited} (destination #${result.destinationId})`,
      );
    });

    // Observed live: the destination always reconciles fully — every credit lands, since each
    // round's destination account is only ever a credit target, never a concurrent source, in
    // this test. See docs/race-condition-report.md for why the two sides behave differently.
    for (const result of results) {
      expect(result.credited).toBe(EXPECTED_PER_ROUND);
    }

    // The source side is where the lost-update race shows up: at least one of the repeated
    // bursts should land short of the full debit. Tracks docs/race-condition-report.md.
    const roundsWithLostUpdate = results.filter((result) => result.debited < EXPECTED_PER_ROUND);
    expect(roundsWithLostUpdate.length).toBeGreaterThan(0);
  });
});
