export interface StockData {
  symbol: string;
  price: number;
  currency: string;
  timestamp: Date;
}

export interface StockProvider {
  getStockData(symbol: string): Promise<StockData>;
  getBatchStockData(symbols: string[]): Promise<StockData[]>;
  isAvailable(): Promise<boolean>;
}
