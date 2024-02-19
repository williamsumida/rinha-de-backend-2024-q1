CREATE TABLE accounts (
	id SERIAL UNIQUE NOT NULL,
	name VARCHAR(50) NOT NULL,
	limit_amount INTEGER NOT NULL,
	balance INTEGER NOT NULL,
  transactions JSON
);

CREATE INDEX idx_accounts ON accounts(id);

INSERT INTO accounts (name, limit_amount, balance, transactions)
VALUES
  ('a', 1000 * 100, 0, '[]'),
  ('b', 800 * 100, 0, '[]'),
  ('c', 10000 * 100, 0, '[]'),
  ('d', 100000 * 100, 0, '[]'),
  ('e', 5000 * 100, 0, '[]');
