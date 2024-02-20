import { Account, Transaction } from "./entities";

export interface AccountRepository {
  createTransaction(clientId: number, transaction: Transaction): Promise<any>;
  getExtract(clientId: number): Promise<Account | null | undefined>;
}
