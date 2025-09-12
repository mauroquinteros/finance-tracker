import { StockProvider, StockData } from "../domain/price-provider";

interface YahooFinanceResponse {
  chart: {
    result: [
      {
        meta: {
          regularMarketPrice: number;
          currency: string;
          symbol: string;
          regularMarketTime: number;
        };
      }
    ];
  };
}

export class YahooFinanceApi {
  private mockPrices: Record<string, number> = {
    AAPL: 201.92,
    V: 335.00,
    AXP: 335.00,
    MSFT: 420.15,
    GOOGL: 156.8,
    TSLA: 244.5,
    VOO: 445.3,
  };

  async fetchQuote(symbol: string): Promise<YahooFinanceResponse> {
    await this.simulateNetworkDelay(100, 200);

    const price = this.mockPrices[symbol];
    if (!price) {
      throw new Error(`Symbol ${symbol} not found in Yahoo Finance`);
    }

    return {
      chart: {
        result: [
          {
            meta: {
              regularMarketPrice: price,
              currency: "USD",
              symbol: symbol,
              regularMarketTime: Date.now() / 1000,
            },
          },
        ],
      },
    };
  }

  private async simulateNetworkDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export class YahooFinanceAdatper implements StockProvider {
  constructor(private service: YahooFinanceApi) {}

  async getStockData(symbol: string): Promise<StockData> {
    try {
      const response = await this.service.fetchQuote(symbol);
      const data = response.chart.result[0].meta;
      return {
        symbol: data.symbol,
        price: data.regularMarketPrice,
        currency: data.currency,
        timestamp: new Date(data.regularMarketTime * 1000),
      };
    } catch (error) {
      console.error(`YahooFinanceAdatper error for ${symbol}:`, error);
      throw new Error(`Failed to fetch price for ${symbol} from Yahoo Finance`);
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
