// ❌ VIOLATING ALL SOLID PRINCIPLES INTENTIONALLY
// These classes are designed to be refactored later

// 🚫 SRP VIOLATION: Transaction class doing too many things
class Transaction {
  constructor(
      public id: string,
      public symbol: string,
      public type: 'BUY' | 'SELL',
      public quantity: number,
      public price: number,
      public date: Date,
      public fees: number = 0
  ) {}

  // ❌ SRP: Transaction shouldn't handle P&L calculations
  calculateProfitLoss(currentPrice: number): number {
      if (this.type === 'BUY') {
          return (currentPrice - this.price) * this.quantity - this.fees;
      } else {
          return (this.price - currentPrice) * this.quantity - this.fees;
      }
  }

  // ❌ SRP: Transaction shouldn't handle persistence
  saveToDatabase(): void {
      console.log(`Saving transaction ${this.id} to database...`);
      // Imagine actual database logic here
  }

  // ❌ SRP: Transaction shouldn't handle notifications
  sendNotification(): void {
      console.log(`📧 Email sent: Transaction ${this.type} of ${this.quantity} ${this.symbol} recorded`);
  }

  // ❌ SRP: Transaction shouldn't format itself for display
  formatForDisplay(): string {
      return `${this.date.toDateString()}: ${this.type} ${this.quantity} shares of ${this.symbol} at $${this.price}`;
  }

  // ❌ SRP: Transaction shouldn't handle validation
  validate(): boolean {
      if (this.quantity <= 0) {
          console.error("Quantity must be positive");
          return false;
      }
      if (this.price <= 0) {
          console.error("Price must be positive");
          return false;
      }
      if (!this.symbol || this.symbol.length < 1) {
          console.error("Symbol is required");
          return false;
      }
      return true;
  }
}

// 🚫 OCP VIOLATION: Portfolio class that needs modification for new features
export class Portfolio {
  private transactions: Transaction[] = [];

  constructor(private userId: string) {}

  addTransaction(transaction: Transaction): void {
      // ❌ OCP: Adding new transaction types requires modifying this method
      if (transaction.type === 'BUY') {
          this.transactions.push(transaction);
          transaction.saveToDatabase();
          transaction.sendNotification();
      } else if (transaction.type === 'SELL') {
          // Check if we have enough shares to sell
          const position = this.getPosition(transaction.symbol);
          if (position && position.quantity >= transaction.quantity) {
              this.transactions.push(transaction);
              transaction.saveToDatabase();
              transaction.sendNotification();
          } else {
              throw new Error("Insufficient shares to sell");
          }
      }
      // ❌ OCP: What if we add DIVIDEND, SPLIT, TRANSFER types? We'd need to modify this!
  }

  // ❌ OCP: Hard-coded calculation methods that can't be extended
  calculateTotalValue(): number {
      const positions = this.getPositions();
      let totalValue = 0;

      // ❌ OCP: Only supports simple average cost calculation
      // What if we want FIFO, LIFO, or other methods?
      for (const position of positions) {
          const currentPrice = this.getCurrentPrice(position.symbol); // Mock method
          totalValue += position.quantity * currentPrice;
      }

      return totalValue;
  }

  private getCurrentPrice(symbol: string): number {
      // ❌ OCP: Hard-coded to only Yahoo Finance
      // What if we want to use Alpha Vantage, IEX, etc?
      console.log(`Getting price for ${symbol} from Yahoo Finance...`);
      return Math.random() * 100 + 50; // Mock price
  }

  getPositions(): Array<{symbol: string, quantity: number, averagePrice: number}> {
      const positionMap = new Map<string, {quantity: number, totalCost: number}>();

      for (const tx of this.transactions) {
          const current = positionMap.get(tx.symbol) || {quantity: 0, totalCost: 0};

          if (tx.type === 'BUY') {
              current.quantity += tx.quantity;
              current.totalCost += (tx.price * tx.quantity) + tx.fees;
          } else if (tx.type === 'SELL') {
              current.quantity -= tx.quantity;
              // Simplified: not adjusting cost basis properly
          }

          positionMap.set(tx.symbol, current);
      }

      return Array.from(positionMap.entries()).map(([symbol, pos]) => ({
          symbol,
          quantity: pos.quantity,
          averagePrice: pos.totalCost / pos.quantity
      }));
  }

  private getPosition(symbol: string) {
      return this.getPositions().find(p => p.symbol === symbol);
  }
}

// 🚫 LSP VIOLATION: Inheritance that breaks substitutability
abstract class BaseTransaction {
  constructor(
      public id: string,
      public symbol: string,
      public quantity: number,
      public price: number,
      public date: Date
  ) {}

  abstract calculateFees(): number;
  abstract validate(): boolean;
}

class StockTransaction extends BaseTransaction {
  calculateFees(): number {
      return this.quantity * this.price * 0.001; // 0.1% fee
  }

  validate(): boolean {
      return this.quantity > 0 && this.price > 0;
  }
}

class CryptoTransaction extends BaseTransaction {
  calculateFees(): number {
      return this.quantity * this.price * 0.025; // 2.5% fee
  }

  validate(): boolean {
      return this.quantity > 0 && this.price > 0;
  }
}

// ❌ LSP VIOLATION: DividendTransaction changes the expected behavior
class DividendTransaction extends BaseTransaction {
  calculateFees(): number {
      return 0; // Dividends have no fees
  }

  validate(): boolean {
      // ❌ LSP: Changes preconditions - dividends don't have quantities in the same sense
      if (this.quantity !== 0) {
          throw new Error("Dividends shouldn't have quantities!"); // Breaks LSP!
      }
      return this.price > 0; // Only dividend amount matters
  }
}

// 🚫 ISP VIOLATION: Fat interface that forces unnecessary dependencies
interface PortfolioManager {
  // Basic operations
  addTransaction(transaction: Transaction): void;
  getPositions(): any[];
  calculateTotalValue(): number;

  // ❌ ISP: Not all implementations need these
  generateTaxReport(): string;
  sendMonthlyReport(): void;
  backupToCloud(): void;
  syncWithBroker(): void;
  calculateDividendYield(): number;
  rebalancePortfolio(): void;
}

// ❌ ISP: SimplePortfolio forced to implement methods it doesn't need
class SimplePortfolio implements PortfolioManager {
  private transactions: Transaction[] = [];

  addTransaction(transaction: Transaction): void {
      this.transactions.push(transaction);
  }

  getPositions(): any[] {
      return [];
  }

  calculateTotalValue(): number {
      return 0;
  }

  // ❌ ISP: Forced to implement these even though SimplePortfolio doesn't need them
  generateTaxReport(): string {
      throw new Error("SimplePortfolio doesn't support tax reports!");
  }

  sendMonthlyReport(): void {
      throw new Error("SimplePortfolio doesn't send reports!");
  }

  backupToCloud(): void {
      throw new Error("SimplePortfolio doesn't backup to cloud!");
  }

  syncWithBroker(): void {
      throw new Error("SimplePortfolio doesn't sync with brokers!");
  }

  calculateDividendYield(): number {
      throw new Error("SimplePortfolio doesn't calculate dividend yield!");
  }

  rebalancePortfolio(): void {
      throw new Error("SimplePortfolio doesn't rebalance!");
  }
}

// 🚫 DIP VIOLATION: High-level modules depending on low-level modules
class PortfolioService {
  private portfolio: Portfolio;

  constructor(userId: string) {
      // ❌ DIP: Directly depends on concrete Portfolio class
      this.portfolio = new Portfolio(userId);
  }

  processTransaction(transactionData: any): void {
      // ❌ DIP: Directly creates concrete Transaction
      const transaction = new Transaction(
          transactionData.id,
          transactionData.symbol,
          transactionData.type,
          transactionData.quantity,
          transactionData.price,
          new Date(),
          transactionData.fees
      );

      // ❌ DIP: Directly depends on Yahoo Finance API
      console.log("Fetching price from Yahoo Finance API...");

      // ❌ DIP: Directly depends on MySQL database
      console.log("Saving to MySQL database...");

      // ❌ DIP: Directly depends on SendGrid email service
      console.log("Sending email via SendGrid...");

      this.portfolio.addTransaction(transaction);
  }

  getPortfolioSummary() {
      // ❌ DIP: Method directly depends on concrete implementations
      return {
          totalValue: this.portfolio.calculateTotalValue(),
          positions: this.portfolio.getPositions()
      };
  }
}

// Example usage showing the violations in action
function demonstrateViolations() {
  // Create a portfolio service (DIP violation - tightly coupled)
  const portfolioService = new PortfolioService("user123");

  // Process a transaction (multiple SOLID violations)
  portfolioService.processTransaction({
      id: "tx001",
      symbol: "AAPL",
      type: "BUY",
      quantity: 100,
      price: 150.50,
      fees: 9.99
  });

  // Try to use different transaction types (LSP violation)
  const transactions: BaseTransaction[] = [
      new StockTransaction("tx001", "AAPL", 100, 150, new Date()),
      new CryptoTransaction("tx002", "BTC", 0.5, 45000, new Date()),
      new DividendTransaction("tx003", "MSFT", 0, 2.50, new Date()) // This will break!
  ];

  // This will throw an error due to LSP violation
  try {
      transactions.forEach(tx => tx.validate());
  } catch (error) {
      console.error("LSP Violation caught:", error);
  }

  // Create SimplePortfolio (ISP violation - implements unnecessary methods)
  const simplePortfolio = new SimplePortfolio();
  try {
      simplePortfolio.generateTaxReport(); // Will throw error
  } catch (error) {
      console.error("ISP Violation - forced to implement unneeded method:", error);
  }
}
