import { CryptoMovement } from "./domain/crypto-movement";
import { DepositMovement } from "./domain/deposit-movement";
import { DividendMovement } from "./domain/dividend-movement";
import { Movement, MovementType } from "./domain/movement";
import {
  DepositMovementData,
  DividendMovementData,
  ShareMovementData,
} from "./domain/movement.interface";
import { StockMovement } from "./domain/stock-movement";

export class MovementFactory {
  static createMovement(type: MovementType, data: any): Movement {
    switch (type) {
      case "STOCK":
        const stockData = data as ShareMovementData;
        return new StockMovement(
          stockData.id,
          stockData.symbol.toUpperCase(),
          stockData.investedAmount,
          stockData.price,
          stockData.fee,
          stockData.date,
          stockData.description
        );

      case "CRYPTO":
        const cryptoData = data as ShareMovementData;
        return new CryptoMovement(
          cryptoData.id,
          cryptoData.symbol.toUpperCase(),
          cryptoData.investedAmount,
          cryptoData.price,
          cryptoData.fee,
          cryptoData.date,
          cryptoData.description
        );

      case "DIVIDEND":
        const dividendData = data as DividendMovementData;
        return new DividendMovement(
          dividendData.id,
          dividendData.grossAmount,
          dividendData.taxWithheld,
          dividendData.symbol.toUpperCase(),
          dividendData.currency,
          dividendData.date,
          dividendData.description
        );

      case "DEPOSIT":
        const depositData = data as DepositMovementData;
        return new DepositMovement(
          depositData.id,
          depositData.grossAmount,
          depositData.fee,
          depositData.depositMethod,
          depositData.currency,
          depositData.date,
          depositData.description
        );
      default:
        throw new Error(`Unknown movement type: ${type}`);
    }
  }

  static createStockMovement(data: ShareMovementData): StockMovement {
    return this.createMovement("STOCK", data) as StockMovement;
  }

  static createCryptoMovement(data: ShareMovementData): CryptoMovement {
    return this.createMovement("CRYPTO", data) as CryptoMovement;
  }

  static createDividendMovement(data: DividendMovementData): DividendMovement {
    return this.createMovement("DIVIDEND", data) as DividendMovement;
  }

  static createDepositMovement(data: DepositMovementData): DepositMovement {
    return this.createMovement("DEPOSIT", data) as DepositMovement;
  }
}
