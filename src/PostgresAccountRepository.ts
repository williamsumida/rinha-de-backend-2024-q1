import { db } from "./database";
import { AccountRepository } from "./AccountRepository";
import { Account, Transaction } from "./entities";
import { errors } from "./errors";

export class PostgresAccountRepository implements AccountRepository {
  async createTransaction(clientId: number, transaction: Transaction) {
    return await db.begin(async (db) => {
      let result = await db`
        SELECT *
        FROM accounts WHERE id = ${clientId} 
        FOR UPDATE;
    `;

      if (result.length == 0) {
        return { account: null, error: errors.ACCOUNT_NOT_FOUND };
      }

      const { id, name, limit_amount, balance, transactions } = result[0];
      let account = new Account(id, name, limit_amount, balance, transactions);

      if (transaction.type === "c") {
        account = this.handleCreditTransaction(account, transaction);
      } else {
        account = this.handleDebitTransaction(account, transaction);
      }

      if (account === null) {
        return { account: null, error: errors.INVALID_TRANSACTION };
      }

      //@ts-ignore
      await db`
        UPDATE accounts
        SET 
          limit_amount = ${account.limit_amount},
          balance = ${account.balance},
          transactions = ${account.transactions}
        WHERE id = ${clientId};
      `;
      return { account, error: null };
    });
  }

  handleCreditTransaction(account: Account, transaction: Transaction) {
    const INSUFFICIENT_LIMIT = transaction.value > account.limit_amount;
    if (INSUFFICIENT_LIMIT) {
      return null;
    }

    account.limit_amount = account.limit_amount - transaction.value;
    account.transactions.push(transaction);
    if (account.transactions.length > 10) {
      account.transactions.shift();
    }
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
    account.transactions.push(transaction);
    return account;
  }

  async getExtract(clientId: number) {
    const result =
      await db`SELECT *, now() as extract_date FROM accounts WHERE id = ${clientId};`;

    if (result.length == 0) return null;

    const { id, name, limit_amount, balance, transactions, extract_date } =
      result[0];

    const account = new Account(
      id,
      name,
      limit_amount,
      balance,
      transactions,
      extract_date,
    );
    return account;
  }
}
