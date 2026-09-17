-- Deterministic seed data for the data-validation module. IDs are fixed on purpose so
-- src/data/db.ts and tests/sql/data-validation.spec.ts can assert on known values.

INSERT INTO customers (customer_id, first_name, last_name, city, state) VALUES
  (1001, 'John', 'Smith', 'Bengaluru', 'KA'),
  (1002, 'Jane', 'Doe',   'Austin',    'TX'),
  (1003, 'Raj',  'Kumar', 'Chicago',   'IL'),
  (1004, 'Amy',  'Chen',  'Seattle',   'WA');

INSERT INTO accounts (account_id, customer_id, account_type, balance) VALUES
  (5001, 1001, 'CHECKING', 1500.00),
  (5002, 1001, 'SAVINGS',  3200.50),
  (5003, 1002, 'CHECKING', 800.00),
  (5004, 1003, 'CHECKING', 120.75),
  (5005, 1003, 'SAVINGS',  4000.00),
  (5006, 1004, 'CHECKING', 60.00);

INSERT INTO transactions (transaction_id, account_id, type, amount, description, transaction_date) VALUES
  (9001, 5001, 'Debit',  50.00,   'Coffee Shop',            '2026-09-01'),
  (9002, 5001, 'Credit', 500.00,  'Payroll Deposit',        '2026-09-02'),
  (9003, 5001, 'Debit',  120.00,  'Electric Bill',          '2026-09-03'),
  (9004, 5001, 'Debit',  15.00,   'Snack',                  '2026-09-04'),
  (9005, 5001, 'Credit', 250.00,  'Refund',                 '2026-09-05'),
  (9006, 5002, 'Credit', 1000.00, 'Bonus Deposit',          '2026-09-02'),
  (9007, 5002, 'Debit',  200.00,  'Rent Transfer',          '2026-09-06'),
  (9008, 5003, 'Debit',  45.00,   'Groceries',              '2026-09-03'),
  (9009, 5003, 'Credit', 300.00,  'Payroll Deposit',        '2026-09-05'),
  (9010, 5004, 'Debit',  20.00,   'Streaming Subscription', '2026-09-04'),
  (9011, 5005, 'Credit', 2000.00, 'Initial Deposit',        '2026-08-15'),
  (9012, 5006, 'Debit',  10.00,   'Coffee Shop',            '2026-09-07');
