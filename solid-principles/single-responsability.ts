export class Transaction {
  constructor(
    public id: string,
    public symbol: string,
    public type: string,
    public quantity: number,
    public price: number,
    public date: Date,
    public fees: number = 0
  ) {}

  validate(): boolean {
    if (this.quantity <= 0) {
      console.error("Quantity must be positive");
      return false;
    }
    if (this.price <= 0) {
      console.error("Price must be positive");
      return false;
    }
    if (!this.symbol) {
      console.error("Symbol is required");
      return false;
    }
    return true;
  }
}

class NotificationService {
  sendNotification(type: string, quantity: string, symbol: string): void {
    console.log(
      `📧 Email sent: Transaction ${type} of ${quantity} ${symbol} recorded`
    );
  }
}

class TransactionRepository {
  saveToDatabase(id: string): void {
    console.log(`Saving transaction ${id} to database...`);
  }
}

class ProfitLossCalculator {
  calculateProfitLoss(
    type: string,
    price: number,
    currentPrice: number,
    quantity: number,
    fees: number
  ): number {
    if (type === "BUY") {
      return (currentPrice - price) * quantity - fees;
    } else {
      return (price - currentPrice) * quantity - fees;
    }
  }
}

export interface ITransactionFactory {
  createTransaction(data: any): Transaction;
}

export class BasicTransactionFactory implements ITransactionFactory {
  createTransaction(transactionData: any): Transaction {
    this.validateTransactionData(transactionData);

    return new Transaction(
      transactionData.id,
      transactionData.symbol,
      transactionData.type,
      transactionData.quantity,
      transactionData.price,
      new Date(),
      transactionData.fees || 0
    );
  }

  private validateTransactionData(data: any): void {
    if (!data.id || !data.symbol || !data.type) {
      throw new Error("Missing required transaction data");
    }
  }
}
