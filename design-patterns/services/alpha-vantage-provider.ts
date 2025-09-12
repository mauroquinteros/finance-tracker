import { StockProvider, StockData } from "../domain/price-provider";

interface AlphaVantageResponse {
  globalQuote: {
    symbol: string;
    price: string;
    latestTradingDay: string;
    change: string;
    changePercent: string;
  };
}

export class AlphaVantageApi {
  private mockPrices: Record<string, string> = {
    AAPL: "201.85",
    V: "335.00",
    AXP: "335.00",
    MSFT: "420.10",
    GOOGL: "156.75",
    TSLA: "244.25",
  };

  async getGlobalQuote(symbol: string): Promise<AlphaVantageResponse> {
    await this.simulateNetworkDelay(100, 200);

    const price = this.mockPrices[symbol];
    if (!price) {
      throw new Error(`Alpha Vantage: Symbol ${symbol} not supported`);
    }

    return {
      globalQuote: {
        symbol: symbol,
        price: price,
        latestTradingDay: new Date().toISOString().split("T")[0],
        change: "2.50",
        changePercent: "1.25%",
      },
    };
  }

  private async simulateNetworkDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export class AlphaVantageAdapter implements StockProvider {
  constructor(private service: AlphaVantageApi) {}

  async getStockData(symbol: string): Promise<StockData> {
    try {
      const response = await this.service.getGlobalQuote(symbol);
      const data = response.globalQuote;
      return {
        symbol: data.symbol,
        price: parseFloat(data.price),
        currency: "USD",
        timestamp: new Date(data.latestTradingDay),
      };
    } catch (error) {
      console.error(`AlphaVantageAdapter error for ${symbol}:`, error);
      throw new Error(`Failed to fetch price for ${symbol} from Alpha Vantage`);
    }
  }

  async getBatchStockData(symbols: string[]): Promise<StockData[]> {
    // 1. Create an array of promises for fetching stock data using getStockData
    const fetchPromises = symbols.map((symbol) => this.getStockData(symbol));

    // 2. Use Promise.allSettled to handle all promises and collect results
    const settled = await Promise.allSettled(fetchPromises);

    // 3. Return the array of successfully fetched. Each item should be of type StockData
    const results: StockData[] = [];
    settled.forEach((res, promiseId) => {
      if (res.status === "fulfilled") {
        results.push(res.value);
      } else {
        // Log which symbol failed and the reason
        console.warn(`Failed to fetch ${symbols[promiseId]}:`, res.reason);
      }
    });

    return results;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
