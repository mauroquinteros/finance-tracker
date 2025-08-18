import { Transaction } from "./single-responsability";

abstract class TransactionHandler {
  abstract canHandle(transactionType: string): boolean;
  abstract process(transaction: Transaction, portfolio: Portfolio): void;
}

class BuyTransactionHandler extends TransactionHandler {
  canHandle(transactionType: string): boolean {
    return transactionType === "BUY";
  }

  process(transaction: Transaction, portfolio: Portfolio): void {
    portfolio.saveTransaction(transaction);
  }
}

class SellTransactionHandler extends TransactionHandler {
  canHandle(transactionType: string): boolean {
    return transactionType === "SELL";
  }

  process(transaction: Transaction, portfolio: Portfolio): void {
    portfolio.saveTransaction(transaction);
  }
}

class DividendTransactionHandler extends TransactionHandler {
  canHandle(transactionType: string): boolean {
    return transactionType === "DIVIDEND";
  }

  process(transaction: Transaction, portfolio: Portfolio): void {
    portfolio.saveTransaction(transaction);
  }
}

export interface IPortfolio {
  addTransaction(transaction: Transaction): void;
  saveTransaction(transaction: Transaction): void;
  getTransactions(): void;
}

export class Portfolio {
  private transactions: Transaction[] = [];
  private handlers: TransactionHandler[] = [];

  constructor() {
    this.handlers.push(new BuyTransactionHandler());
    this.handlers.push(new SellTransactionHandler());
    this.handlers.push(new DividendTransactionHandler());
  }

  addTransaction(transaction: Transaction): void {
    const handler = this.handlers.find((handler) =>
      handler.canHandle(transaction.type)
    );
    if (!handler) {
      throw new Error(`No handler for transaction type: ${transaction.type}`);
    }
    handler.process(transaction, this);
  }

  saveTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  getTransactions() {
    console.log(this.transactions);
  }
}

function main() {
  const portfolio = new Portfolio();

  const transaction1 = new Transaction(
    "tx001",
    "AAPL",
    "BUY",
    10,
    150.25,
    new Date("2024-05-01"),
    1.15
  );
  const transaction2 = new Transaction(
    "tx002",
    "MSFT",
    "BUY",
    5,
    320.1,
    new Date("2024-05-03"),
    1.15
  );
  const transaction3 = new Transaction(
    "tx003",
    "AAPL",
    "DIVIDEND",
    3,
    155.0,
    new Date("2024-05-10"),
    1.15
  );

  portfolio.addTransaction(transaction1);
  portfolio.addTransaction(transaction2);
  portfolio.addTransaction(transaction3);

  portfolio.getTransactions();
}
