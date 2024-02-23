//import { AccountRepository } from "./AccountRepository";
import { Account, Transaction } from "./entities";
import { errors } from "./errors";
import { app } from "./server";
import { pool } from "./database";
//import { client } from "./database";

export class PostgresAccountRepository {
  async createTransaction(
    clientId: number,
    transaction: Transaction,
  ): Promise<any> {
    try {
      const client = await pool.connect();
      //await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE;");
      //await client.query("BEGIN;");
      const result = await client.query(
        `
        SELECT limit_amount, balance
        FROM accounts 
        WHERE id = $1;
      `,
        [clientId],
      );

      let { limit_amount, balance } = result.rows[0];

      if (transaction.type === "c") {
        limit_amount = this.handleCreditTransaction(limit_amount, transaction);
      } else {
        balance = this.handleDebitTransaction(
          balance,
          limit_amount,
          transaction,
        );
      }

      if (limit_amount === null || balance === null) {
        return { account: null, error: errors.INVALID_TRANSACTION };
      }

      app.log.info(limit_amount, balance, clientId);
      await client.query(
        `
          UPDATE accounts
          SET 
            limit_amount = $1,
            balance = $2
          WHERE id = $3;
        `,
        [limit_amount, balance, clientId],
      );

      await client.query(
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
      );

      client.release();

      const account = { limit_amount, balance };
      return { account, error: null };
    } catch (error) {
      app.log.error(error);
      //return await this.createTransaction(clientId, transaction);
      return { account: null, error: errors.INVALID_TRANSACTION };
    }
  }

  handleCreditTransaction(limit_amount: number, transaction: Transaction) {
    const INSUFFICIENT_LIMIT = transaction.value > limit_amount;
    if (INSUFFICIENT_LIMIT) {
      return null;
    }

    return limit_amount - transaction.value;
  }

  handleDebitTransaction(
    balance: number,
    limit_amount: number,
    transaction: Transaction,
  ) {
    // saldo nao pode ser maior que o limite
    const INSUFFICIENT_BALANCE =
      -1 * (balance - transaction.value) > limit_amount;

    if (INSUFFICIENT_BALANCE) {
      return null;
    }

    return balance - transaction.value;
  }

  async getExtract(clientId: number): Promise<any> {
    try {
      const client = await pool.connect();
      const account_db = await client.query(
        `
        SELECT limit_amount, balance, now() as extract_date 
        FROM accounts
        WHERE id = $1;
        `,
        [clientId],
      );
      const transactions_db = await client.query(
        `
        SELECT value, type, description
        FROM transactions
        WHERE account_id = $1
        ORDER BY date DESC
        LIMIT 10;
        `,
        [clientId],
      );

      client.release();
      const { limit_amount, balance, extract_date } = account_db.rows[0];

      const transactions: Array<any> = [];

      transactions_db.rows.forEach((t) => {
        transactions.push({
          valor: t.value,
          tipo: t.type,
          descricao: t.description,
        });
      });

      return {
        saldo: {
          total: balance,
          data_extrato: extract_date,
          limite: limit_amount,
        },
        ultimas_transacoes: transactions,
      };
    } catch (error) {
      app.log.error(error);
      return { account: null, error: errors.INVALID_TRANSACTION };
    }
  }
}
