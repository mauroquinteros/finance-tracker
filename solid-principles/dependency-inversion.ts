import { IPortfolio, Portfolio } from "./open-closed";
import {
  ITransactionFactory,
  BasicTransactionFactory,
} from "./single-responsability";

class PortfolioService {
  constructor(
    private portfolio: IPortfolio,
    private transactionFactory: ITransactionFactory
  ) {}

  processTransaction(transactionData: any): void {
    const transaction =
      this.transactionFactory.createTransaction(transactionData);

    this.portfolio.addTransaction(transaction);
  }

  getPortfolioSummary() {
    this.portfolio.getTransactions();
  }
}

function main() {
  const portfolio = new Portfolio();
  const basicFactory = new BasicTransactionFactory();
  const portfolioService = new PortfolioService(portfolio, basicFactory);

  portfolioService.processTransaction({
    id: "tx001",
    symbol: "AAPL",
    type: "BUY",
    quantity: 10,
    price: 150.25,
    fees: 1.15,
  });
  portfolioService.processTransaction({
    id: "tx002",
    symbol: "MSFT",
    type: "BUY",
    quantity: 5,
    price: 320.1,
    fees: 1.15,
  });
  portfolioService.getPortfolioSummary();
}

main();
