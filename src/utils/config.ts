import * as dotenv from 'dotenv';

dotenv.config();

export type Environment = 'qa' | 'staging' | 'local';

export interface EnvironmentConfig {
  env: Environment;
  baseUrl: string;
  apiBaseUrl: string;
  defaultTimeoutMs: number;
}

/**
 * ParaBank only exposes one real deployment; "staging" mirrors "qa" today so the
 * env-selection mechanism exists before Sprint 4/5 need it against a second target.
 */
/**
 * baseUrl always ends in "/": WHATWG URL resolution treats a leading-slash
 * relative path (e.g. "/index.htm") as root-relative, which silently drops
 * the "/parabank" sub-path. Page objects use paths with no leading slash
 * (e.g. "index.htm") so they resolve relative to this trailing slash instead.
 */
const DEFAULTS: Record<Environment, Omit<EnvironmentConfig, 'env'>> = {
  qa: {
    baseUrl: 'https://parabank.parasoft.com/parabank/',
    apiBaseUrl: 'https://parabank.parasoft.com/parabank/services/bank',
    defaultTimeoutMs: 10_000,
  },
  staging: {
    baseUrl: 'https://parabank.parasoft.com/parabank/',
    apiBaseUrl: 'https://parabank.parasoft.com/parabank/services/bank',
    defaultTimeoutMs: 10_000,
  },
  local: {
    baseUrl: 'http://localhost:8080/parabank/',
    apiBaseUrl: 'http://localhost:8080/parabank/services/bank',
    defaultTimeoutMs: 15_000,
  },
};

function resolveEnvironment(): Environment {
  const raw = (process.env.TEST_ENV ?? 'qa').trim().toLowerCase();
  if (raw === 'qa' || raw === 'staging' || raw === 'local') {
    return raw;
  }
  throw new Error(`Unknown TEST_ENV "${raw}". Expected one of: qa, staging, local.`);
}

function buildConfig(): EnvironmentConfig {
  const env = resolveEnvironment();
  const defaults = DEFAULTS[env];
  return {
    env,
    baseUrl: process.env.BASE_URL ?? defaults.baseUrl,
    apiBaseUrl: process.env.API_BASE_URL ?? defaults.apiBaseUrl,
    defaultTimeoutMs: defaults.defaultTimeoutMs,
  };
}

export const config: EnvironmentConfig = buildConfig();
