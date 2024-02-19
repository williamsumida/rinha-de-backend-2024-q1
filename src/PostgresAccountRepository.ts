import { db } from "./database";
import { AccountRepository } from "./AccountRepository";
import { Account, Transaction } from "./entities";

export class PostgresAccountRepository implements AccountRepository {
  async createTransaction(clientId: number, transaction: Transaction) {}

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
