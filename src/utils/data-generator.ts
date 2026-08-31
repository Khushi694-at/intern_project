import type { BillPayData, RegistrationData } from '../data/types';

function randomDigits(length: number): string {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Builds a unique registration payload per call so parallel/repeated test runs
 * never collide on ParaBank's globally-unique username constraint.
 */
export function generateRegistrationData(overrides: Partial<RegistrationData> = {}): RegistrationData {
  const suffix = `${Date.now()}${randomDigits(6)}`;
  return {
    firstName: 'Test',
    lastName: 'User',
    street: '123 Test Street',
    city: 'Bengaluru',
    state: 'KA',
    zipCode: '560001',
    phoneNumber: randomDigits(10),
    ssn: randomDigits(9),
    username: `sdet_${suffix}`,
    password: `Pwd_${suffix}`,
    ...overrides,
  };
}

/**
 * Builds a valid bill-pay payload. `accountNumber`/`verifyAccountNumber`/`fromAccountId`
 * are caller-supplied since they must reference a real account owned by the test user.
 */
export function generateBillPayData(overrides: Partial<BillPayData> & Pick<BillPayData, 'fromAccountId'>): BillPayData {
  const suffix = randomDigits(6);
  const accountNumber = overrides.accountNumber ?? overrides.fromAccountId;
  return {
    payeeName: `Electric Co ${suffix}`,
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
    },
    phoneNumber: randomDigits(10),
    accountNumber,
    verifyAccountNumber: accountNumber,
    amount: 25,
    ...overrides,
  };
}
