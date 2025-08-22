import {
  DepositMovementData,
  DividendMovementData,
  ShareMovementData,
} from "./domain/movement.interface";
import { MovementFactory } from "./movement-factory";

function demonstrateMovementFactory() {
  const stockData: ShareMovementData = {
    id: "stock001",
    symbol: "AAPL",
    investedAmount: 200,
    price: 201.92,
    fee: 0.15,
  };

  const stockMovement = MovementFactory.createMovement("STOCK", stockData);
  console.log(stockMovement.getDisplayInfo());

  const cryptoData: ShareMovementData = {
    id: "crypto001",
    symbol: "BTCUSD",
    investedAmount: 861.5,
    price: 95815.8,
    fee: 8.62,
  };

  const cryptoMovement = MovementFactory.createCryptoMovement(cryptoData);
  console.log(cryptoMovement.getDisplayInfo());

  const dividendData: DividendMovementData = {
    id: "div001",
    symbol: "VOO",
    grossAmount: 8.0,
    taxWithheld: 2.4,
  };

  const dividendMovement = MovementFactory.createDividendMovement(dividendData);
  console.log(dividendMovement.getDisplayInfo());

  const depositData: DepositMovementData = {
    id: "dep001",
    grossAmount: 706.3,
    fee: 6.3,
    depositMethod: "BANK_TRANSFER",
  };

  const depositMovement = MovementFactory.createDepositMovement(depositData);
  console.log(depositMovement.getDisplayInfo());
}

demonstrateMovementFactory();
