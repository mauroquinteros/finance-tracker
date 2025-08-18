export abstract class PortfolioEvent {
  constructor(public id: string, public symbol: string, public date: Date) {}

  abstract calculateFees(): number;
  abstract validate(): boolean;
}

abstract class ShareBasedTransaction extends PortfolioEvent {
  constructor(
    id: string,
    symbol: string,
    date: Date,
    public quantity: number, // Only share-based have quantity
    public price: number
  ) {
    super(id, symbol, date);
  }

  validate(): boolean {
    return this.quantity > 0 && this.price > 0;
  }
}

abstract class CashBasedEvent extends PortfolioEvent {
  constructor(
    id: string,
    symbol: string,
    date: Date,
    public amount: number // Only cash-based have amount
  ) {
    super(id, symbol, date);
  }

  validate(): boolean {
    return this.amount > 0;
  }
}

export class StockTransaction extends ShareBasedTransaction {
  calculateFees(): number {
    return this.quantity * this.price * 0.001;
  }
}

export class CryptoTransaction extends ShareBasedTransaction {
  calculateFees(): number {
    return this.quantity * this.price * 0.025;
  }
}

export class DividendTransaction extends CashBasedEvent {
  calculateFees(): number {
    return 0;
  }
}

function getTransacion(transaction: PortfolioEvent) {
  console.log("Fees: ", transaction.calculateFees());
}

function main() {
  const cryptoTransaction = new CryptoTransaction(
    "tx001",
    "BTC",
    new Date(),
    1,
    120000
  );

  const dividendTransaction = new DividendTransaction(
    "txt002",
    "APPL",
    new Date(),
    3.25
  );

  getTransacion(cryptoTransaction);
  getTransacion(dividendTransaction);
}

main();
