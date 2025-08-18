import { Transaction } from "./single-responsability";

interface PortfolioBaseOperations {
  addTransaction(transaction: Transaction): void;
  getPositions(): any[];
  calculateTotalValue(): number;
}

interface PortfolioManager extends PortfolioBaseOperations {
  generateTaxReport(): string;
  sendMonthlyReport(): void;
  backupToCloud(): void;
  syncWithBroker(): void;
  calculateDividendYield(): number;
  rebalancePortfolio(): void;
}

class SimplePortfolio implements PortfolioBaseOperations {
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
}
