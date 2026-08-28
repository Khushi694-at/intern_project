import type { RegistrationData } from '../data/types';

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
  const suffix = `${Date.now()}${randomDigits(3)}`;
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
