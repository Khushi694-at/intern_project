import { execFileSync } from 'node:child_process';
import * as path from 'node:path';

/**
 * Re-seeds sql/bank.sqlite before every test run (UI, API, or SQL) so the data-validation suite
 * never depends on whatever was left over from a previous run. Shells out to sql/seed.js (plain
 * CommonJS, no ts-node needed) rather than re-implementing the seeding logic here.
 */
export default function globalSetup(): void {
  execFileSync(process.execPath, [path.join(__dirname, '../../sql/seed.js')], { stdio: 'inherit' });
}
