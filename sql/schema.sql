-- A small bank schema (customers / accounts / transactions) for the data-validation module.
-- Deliberately independent of ParaBank's own database: this demonstrates SELECT/WHERE/JOIN/GROUP BY
-- against a seeded local dataset, asserted from TypeScript (src/data/db.ts), separate from the
-- UI/API layers which exercise the real ParaBank application.

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL
);

CREATE TABLE accounts (
  account_id   INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers (customer_id),
  account_type TEXT NOT NULL CHECK (account_type IN ('CHECKING', 'SAVINGS')),
  balance      NUMERIC NOT NULL
);

CREATE TABLE transactions (
  transaction_id   INTEGER PRIMARY KEY,
  account_id       INTEGER NOT NULL REFERENCES accounts (account_id),
  type             TEXT NOT NULL CHECK (type IN ('Debit', 'Credit')),
  amount           NUMERIC NOT NULL,
  description      TEXT NOT NULL,
  transaction_date TEXT NOT NULL -- ISO 'YYYY-MM-DD'
);

CREATE INDEX idx_accounts_customer_id ON accounts (customer_id);
CREATE INDEX idx_transactions_account_id ON transactions (account_id);
