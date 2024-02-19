export class Account {
  public id: number;
  public name: string;
  public limit_amount: number;
  public balance: number;
  public transactions: Array<Transaction>;
  public extract_date: Date;

  constructor(
    id: number,
    name: string,
    limit_amount: number,
    balance: number,
    transactions: Array<Transaction>,
    extract_date: Date,
  ) {
    this.id = id;
    this.name = name;
    this.limit_amount = limit_amount;
    this.balance = balance;
    this.transactions = transactions;
    this.extract_date = extract_date;
  }
}

export class Transaction {
  public value: number;
  public type: string;
  public description: string;

  constructor(value: number, type: string, description: string) {
    this.value = value;
    this.type = type;
    this.description = description;
  }
}
