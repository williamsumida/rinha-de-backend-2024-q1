import { client } from "./database";

export async function createTransaction(
  clientId: number,
  value: number,
  transaction_type: string,
  description: string,
): Promise<any> {
  try {
    //const client = await pool.connect();

    let res = null;
    if (transaction_type === "c") {
      res = await client.query(`
          UPDATE accounts
          SET 
            balance = balance + ${value}
          WHERE
            id = ${clientId}
          RETURNING balance, limit_amount;
        `);
    } else {
      res = await client.query(`
          UPDATE accounts
          SET 
            balance = balance - ${value}
          WHERE
            id = ${clientId} AND
            limit_amount > (balance - ${value}) * -1
          RETURNING balance, limit_amount;
        `);
    }

    if (res.rows.length == 0) {
      return { account: null, error: true };
    }

    await client.query(
      `
          INSERT INTO transactions(account_id, value, type, description)
          VALUES(${clientId}, ${value}, '${transaction_type}', '${description}');
        `,
    );

    //client.release();

    return {
      account: {
        limit_amount: res.rows[0].limit_amount,
        balance: res.rows[0].balance,
      },
      error: false,
    };
  } catch (error) {
    console.error(error);
    return { account: null, error: true };
  }
}

export async function getExtract(clientId: number): Promise<any> {
  try {
    //const client = await pool.connect();

    const extract = await client.query(
      `
        SELECT *, NOW() as extract_date
        FROM accounts a
        LEFT JOIN transactions t ON a.id = t.account_id
        WHERE a.id = ${clientId}
        ORDER BY date DESC
        LIMIT 10;
        `,
    );
    //client.release();

    const transactions: Array<any> = [];

    for (let i = 0; i < extract.rows.length; i++) {
      if (extract.rows[i].type) {
        transactions.push({
          valor: extract.rows[i].value,
          tipo: extract.rows[i].type,
          descricao: extract.rows[i].description,
        });
      }
    }

    return {
      saldo: {
        total: extract.rows[0].balance,
        data_extrato: extract.rows[0].extract_date,
        limite: extract.rows[0].limit_amount,
      },
      ultimas_transacoes: transactions,
    };
  } catch (error) {
    console.error(error);
    return { account: null, error: true };
  }
}
export async function resetDatabase() {
  client.query("DELETE FROM transactions;");
  client.query(
    "UPDATE accounts SET limit_amount = 100000, balance = 0 WHERE id = 1;",
  );
}
