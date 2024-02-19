import { Account, Transaction } from "./entities";

export interface AccountRepository {
  createTransaction(
    clientId: number,
    transaction: Transaction,
  ): Promise<Account | null | undefined>;
  getExtract(clientId: number): Promise<Account | null | undefined>;
}
