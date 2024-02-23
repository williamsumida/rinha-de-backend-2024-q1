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

      let res = null;
      if (transaction.type === "c") {
        res = await client.query(`
          UPDATE accounts
          SET 
            balance = balance + ${transaction.value}
          WHERE
            id = ${clientId}
          RETURNING balance, limit_amount;
        `);
      } else {
        res = await client.query(`
          UPDATE accounts
          SET 
            balance = balance - ${transaction.value}
          WHERE
            id = ${clientId} AND
            limit_amount > (balance - ${transaction.value}) * -1
          RETURNING balance, limit_amount;
        `);
      }

      if (res.rows.length == 0) {
        return { account: null, error: errors.INVALID_TRANSACTION };
      }

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

      const account = {
        limit_amount: res.rows[0].limit_amount,
        balance: res.rows[0].balance,
      };
      return { account, error: null };
    } catch (error) {
      app.log.error(error);
      return { account: null, error: errors.INVALID_TRANSACTION };
    }
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
