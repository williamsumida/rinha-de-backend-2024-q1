import { AccountRepository } from "./AccountRepository";
import { Account, Transaction } from "./entities";
import { errors } from "./errors";
import { app } from "./server";
import { client } from "./database";
//import { client } from "./database";

export class PostgresAccountRepository implements AccountRepository {
  async createTransaction(clientId: number, transaction: Transaction) {
    try {
      await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE;");
      //await client.query("BEGIN;");
      const result = await client.query(
        `
        SELECT *
        FROM accounts WHERE id = $1
        FOR UPDATE;
      `,
        [clientId],
      );

      //if (result.rows.length == 0) {
      //  return { account: null, error: errors.ACCOUNT_NOT_FOUND };
      //}

      const { id, name, limit_amount, balance } = result.rows[0];
      let account = new Account(id, name, limit_amount, balance);

      if (transaction.type === "c") {
        account = this.handleCreditTransaction(account, transaction);
      } else {
        account = this.handleDebitTransaction(account, transaction);
      }

      if (account === null) {
        return { account: null, error: errors.INVALID_TRANSACTION };
      }

      await Promise.all([
        client.query(
          `
          UPDATE accounts
          SET 
            limit_amount = $1,
            balance = $2
          WHERE id = $3;
        `,
          [account.limit_amount, account.balance, clientId],
        ),

        client.query(
          `
          INSERT INTO transactions(account_id, value, type, description)
          VALUES($1, $2, $3, $4);
        `,
          [
            clientId,
            transaction.value,
            transaction.type,
            transaction.description,
          ],
        ),
      ]);

      await client.query("COMMIT;");
      return { account, error: null };
    } catch (error) {
      app.log.error(error);
      setInterval(() => {}, 300);
      return await this.createTransaction(clientId, transaction);
    }
  }

  handleCreditTransaction(account: Account, transaction: Transaction) {
    const INSUFFICIENT_LIMIT = transaction.value > account.limit_amount;
    if (INSUFFICIENT_LIMIT) {
      return null;
    }

    account.limit_amount = account.limit_amount - transaction.value;
    return account;
  }

  handleDebitTransaction(account: Account, transaction: Transaction) {
    // saldo nao pode ser maior que o limite
    const INSUFFICIENT_BALANCE =
      -1 * (account.balance - transaction.value) > account.limit_amount;

    if (INSUFFICIENT_BALANCE) {
      return null;
    }

    account.balance = account.balance - transaction.value;
    return account;
  }

  async getExtract(clientId: number) {
    try {
      const [account_db, transactions_db] = await Promise.all([
        client.query(
          `
        SELECT *, now() as extract_date 
        FROM accounts
        WHERE id = $1;
        `,
          [clientId],
        ),
        client.query(
          `
        SELECT value, type, description
        FROM transactions
        WHERE account_id = $1
        ORDER BY date DESC
        LIMIT 10;
        `,
          [clientId],
        ),
      ]);

      const { id, name, limit_amount, balance, extract_date } =
        account_db.rows[0];

      const transactions: Array<Transaction> = [];

      transactions_db.rows.forEach((t) => {
        transactions.push(new Transaction(t.value, t.type, t.description));
      });

      const account = new Account(
        id,
        name,
        limit_amount,
        balance,
        transactions,
        extract_date,
      );
      return account;
    } catch (error) {
      setInterval(() => {}, 300);
      return await this.getExtract(clientId);
    }
  }
}
