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
