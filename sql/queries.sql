-- Reference copies of the queries executed from code (src/data/db.ts). Kept here, matching the
-- brief's "write and save queries demonstrating SELECT/WHERE/JOIN/GROUP BY in sql/" requirement,
-- as the source of truth for what each BankDatabase method runs.

-- SELECT + WHERE: every account owned by one customer.
SELECT account_id, customer_id, account_type, balance
FROM accounts
WHERE customer_id = 1001;

-- SELECT + WHERE (range): transactions on one account at/above a minimum amount.
SELECT transaction_id, account_id, type, amount, description, transaction_date
FROM transactions
WHERE account_id = 5001 AND amount >= 100
ORDER BY amount DESC;

-- JOIN: transactions on an account with the owning customer's name attached.
SELECT t.transaction_id, t.account_id, t.type, t.amount, t.description, t.transaction_date,
       c.first_name, c.last_name
FROM transactions t
JOIN accounts a ON a.account_id = t.account_id
JOIN customers c ON c.customer_id = a.customer_id
WHERE t.account_id = 5001
ORDER BY t.transaction_id;

-- JOIN + GROUP BY: per-customer account count and total balance across all their accounts.
SELECT c.customer_id, c.first_name, c.last_name,
       COUNT(a.account_id) AS account_count,
       SUM(a.balance) AS total_balance
FROM customers c
JOIN accounts a ON a.customer_id = c.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_balance DESC;
