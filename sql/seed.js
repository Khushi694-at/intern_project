'use strict';

// Plain Node (no ts-node) so `npm run sql:seed` and Playwright's globalSetup can both run it
// without a TypeScript build step. Re-creates sql/bank.sqlite from scratch every time it's run,
// so the data-validation suite always starts from the same known dataset (sql/*.sqlite is
// gitignored — this file is the source of truth, not the binary it produces).

const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const SQL_DIR = __dirname;
const DB_PATH = path.join(SQL_DIR, 'bank.sqlite');

function seed() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const db = new Database(DB_PATH);
  try {
    db.exec(fs.readFileSync(path.join(SQL_DIR, 'schema.sql'), 'utf8'));
    db.exec(fs.readFileSync(path.join(SQL_DIR, 'seed-data.sql'), 'utf8'));
  } finally {
    db.close();
  }

  return DB_PATH;
}

if (require.main === module) {
  const dbPath = seed();
  console.log(`Seeded ${dbPath}`);
}

module.exports = { seed, DB_PATH };
