import type { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from '../utils/config';
import type { AccountType } from '../data/types';

const JSON_HEADERS = { Accept: 'application/json' };

/** ParaBank's REST create-account endpoint takes an account-type code, not the type name. */
const NEW_ACCOUNT_TYPE_CODE: Record<AccountType, number> = { CHECKING: 0, SAVINGS: 1 };

/**
 * Thin wrapper over ParaBank's REST services (`/services/bank`), so API tests read as intent —
 * "create an account", "transfer funds" — rather than hand-built URLs and query strings repeated
 * across every spec. Every endpoint here was confirmed against the live service before use; two
 * are not what their path shape suggests (see the method-level notes below).
 */
export class ParaBankApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string = config.apiBaseUrl,
  ) {}

  login(username: string, password: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/login/${username}/${password}`, {
      headers: JSON_HEADERS,
    });
  }

  getCustomer(customerId: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/customers/${customerId}`, { headers: JSON_HEADERS });
  }

  getAccountsForCustomer(customerId: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/customers/${customerId}/accounts`, {
      headers: JSON_HEADERS,
    });
  }

  getAccount(accountId: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/accounts/${accountId}`, { headers: JSON_HEADERS });
  }

  /**
   * Lives at `/createAccount?customerId=&newAccountType=&fromAccountId=`, not at
   * `/accounts/{customerId}/{type}/{fromAccountId}` as the rest of the `/accounts` resource
   * shape would suggest — confirmed by probing the live service (see docs/ai-usage-log.md).
   */
  createAccount(
    customerId: number,
    newAccountType: AccountType,
    fromAccountId: number,
  ): Promise<APIResponse> {
    const typeCode = NEW_ACCOUNT_TYPE_CODE[newAccountType];
    return this.request.post(
      `${this.baseUrl}/createAccount?customerId=${customerId}&newAccountType=${typeCode}&fromAccountId=${fromAccountId}`,
      { headers: JSON_HEADERS },
    );
  }

  transfer(fromAccountId: number, toAccountId: number, amount: number): Promise<APIResponse> {
    return this.request.post(
      `${this.baseUrl}/transfer?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&amount=${amount}`,
      { headers: JSON_HEADERS },
    );
  }

  /**
   * Unscoped by design — `/transactions/{id}`, not nested under `/accounts/{accountId}/...` like
   * the amount/date searches below. Confirmed live: the account-scoped path 404s even for a
   * transaction that really does belong to that account.
   */
  findTransactionById(transactionId: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/transactions/${transactionId}`, {
      headers: JSON_HEADERS,
    });
  }

  findTransactionsByAmount(accountId: number, amount: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/accounts/${accountId}/transactions/amount/${amount}`, {
      headers: JSON_HEADERS,
    });
  }

  /** `fromDate`/`toDate` must be `M-D-YYYY`, matching the Find Transactions UI form. */
  findTransactionsByDateRange(
    accountId: number,
    fromDate: string,
    toDate: string,
  ): Promise<APIResponse> {
    return this.request.get(
      `${this.baseUrl}/accounts/${accountId}/transactions/fromDate/${fromDate}/toDate/${toDate}`,
      { headers: JSON_HEADERS },
    );
  }
}
