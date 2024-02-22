CREATE UNLOGGED TABLE accounts (
	id SERIAL UNIQUE NOT NULL,
	name VARCHAR(50) NOT NULL,
	limit_amount INTEGER NOT NULL,
	balance INTEGER NOT NULL
);

CREATE UNLOGGED TABLE transactions (
	id SERIAL PRIMARY KEY,
	account_id INTEGER NOT NULL,
	value INTEGER NOT NULL,
	type CHAR(1) NOT NULL,
	description VARCHAR(10) NOT NULL,
	date TIMESTAMP NOT NULL DEFAULT NOW()
);

--CREATE INDEX idx_cov_accounts ON accounts(id) INCLUDE (limit_amount, balance);
--CREATE INDEX idx_transactions_account_id ON transactions(account_id);

INSERT INTO accounts (name, limit_amount, balance)
VALUES
  ('a', 1000 * 100, 0),
  ('b', 800 * 100, 0),
  ('c', 10000 * 100, 0),
  ('d', 100000 * 100, 0),
  ('e', 5000 * 100, 0);
