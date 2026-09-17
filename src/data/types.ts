export type AccountType = 'CHECKING' | 'SAVINGS';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  ssn: string;
}

export interface RegistrationData extends Address {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface OpenAccountData {
  accountType: AccountType;
  fromAccountId: string;
}

export interface TransferFundsData {
  amount: number;
  fromAccountId: string;
  toAccountId: string;
}

export interface BillPayData {
  payeeName: string;
  address: Omit<Address, 'phoneNumber' | 'ssn'>;
  phoneNumber: string;
  accountNumber: string;
  verifyAccountNumber: string;
  amount: number;
  fromAccountId: string;
}

/** Shape of ParaBank REST's `/accounts/{id}` and `/customers/{id}/accounts` responses. */
export interface ApiAccount {
  id: number;
  customerId: number;
  type: AccountType;
  balance: number;
}

/** Shape of ParaBank REST's `/customers/{id}` and `/login/{username}/{password}` responses. */
export interface ApiCustomer {
  id: number;
  firstName: string;
  lastName: string;
  address: Omit<Address, 'phoneNumber' | 'ssn'>;
  phoneNumber: string;
  ssn: string;
}

/** Shape of ParaBank REST's transaction-search responses (by id/amount/date). */
export interface ApiTransaction {
  id: number;
  accountId: number;
  type: 'Debit' | 'Credit';
  date: number;
  amount: number;
  description: string;
}
