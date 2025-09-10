import {
  DepositMovementData,
  DividendMovementData,
  ShareMovementData,
} from "./domain/movement.interface";
import { PortfolioCalculatorBuilder } from "./domain/portfolio-builder";
import { MovementFactory } from "./movement-factory";

async function main() {
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

  console.log("\nPORTFOLIO CALCULATOR BUILDER - DEMO COMPLETA\n");

  // Crear movimientos de ejemplo usando tu Factory existente
  const movements = [
    // Compras de AAPL en diferentes fechas y precios
    MovementFactory.createMovement("STOCK", {
      id: "demo001",
      symbol: "V",
      investedAmount: 100, // 10 shares @ $100
      price: 266.92,
      fee: 0.15,
      date: new Date("2024-07-08"),
    }),

    MovementFactory.createMovement("STOCK", {
      id: "demo002",
      symbol: "V",
      investedAmount: 200, // 5 shares @ $220
      price: 276.88,
      fee: 0.15,
      date: new Date("2024-09-24"),
    }),

    // MSFT para tener diversificación
    MovementFactory.createMovement("STOCK", {
      id: "demo003",
      symbol: "AXP",
      investedAmount: 102, // 5 shares @ $420
      price: 234.78,
      fee: 0.15,
      date: new Date("2024-05-08"),
    }),

    // Más AAPL en Q2
    MovementFactory.createMovement("STOCK", {
      id: "demo004",
      symbol: "V",
      investedAmount: 200, // 3 shares @ $200
      price: 282.43,
      fee: 0.15,
      date: new Date("2024-10-15"),
    }),

    // Más AAPL en Q2
    MovementFactory.createMovement("STOCK", {
      id: "demo005",
      symbol: "V",
      investedAmount: 100, // 3 shares @ $200
      price: 309.67,
      fee: 0.15,
      date: new Date("2025-04-07"),
    }),
  ];

  const currentPrices = new Map([
    ["V", 342.69], // Subió desde las compras
    ["AXP", 326.86], // También subió
  ]);

  console.log("\n📊 ANÁLISIS BÁSICO DEL PORTFOLIO\n");

  const basicCalculator = new PortfolioCalculatorBuilder().build();
  const basicResult = await basicCalculator.calculate(movements, currentPrices);

  console.log(`💰 Total Invertido: $${basicResult.totalInvested.toFixed(2)}`);
  console.log(`📈 Valor Actual: $${basicResult.totalCurrentValue.toFixed(2)}`);
  console.log(
    `${
      basicResult.unrealizedPnL >= 0 ? "🟢" : "🔴"
    } P&L: $${basicResult.unrealizedPnL.toFixed(
      2
    )} (${basicResult.unrealizedPnLPercentage.toFixed(2)}%)`
  );
  console.log(`📋 Método: ${basicResult.calculationMethod}`);
  console.log(`📅 Periodo: ${basicResult.calculationPeriod}\n`);

  console.log("\n🍎 ANÁLISIS DE VISA ESPECÍFICAMENTE\n");
  const stockCalculator = new PortfolioCalculatorBuilder()
    .setSymbol("V")
    .build();
  const stockResult = await stockCalculator.calculate(movements, currentPrices);

  if (stockResult.positions.length > 0) {
    const position = stockResult.positions[0];
    console.log(`Posición en VISA:`);
    console.log(`Shares: ${position.totalShares.toFixed(4)}`);
    console.log(`Total Invertido: $${stockResult.totalInvested.toFixed(2)}`);
    console.log(
      `Precio Promedio Pagado: $${position.averageCostPerShare.toFixed(2)}`
    );
    console.log(`Precio Actual: $${position.currentPricePerShare.toFixed(2)}`);
    console.log(
      `${
        stockResult.unrealizedPnL >= 0 ? "🟢" : "🔴"
      } P&L: $${stockResult.unrealizedPnL.toFixed(
        2
      )} (${stockResult.unrealizedPnLPercentage.toFixed(2)}%)`
    );
  } else {
    console.log("❌ No se encontraron posiciones de VISA");
  }

  console.log("\n📅 ANÁLISIS TRIMESTRAL (Q2 2024)\n");
  const q2Start = new Date("2024-04-01");
  const q2End = new Date("2024-06-30");
  const quarterlyCalculator = new PortfolioCalculatorBuilder()
    .setDateRange(q2Start, q2End)
    .build();
  const quarterlyResult = await quarterlyCalculator.calculate(
    movements,
    currentPrices
  );

  if (quarterlyResult.positions.length > 0) {
    const position = quarterlyResult.positions[0];
    console.log(`Posición en VISA:`);
    console.log(`Shares: ${position.totalShares.toFixed(4)}`);
    console.log(
      `Total Invertido: $${quarterlyResult.totalInvested.toFixed(2)}`
    );
    console.log(
      `Precio Promedio Pagado: $${position.averageCostPerShare.toFixed(2)}`
    );
    console.log(`Precio Actual: $${position.currentPricePerShare.toFixed(2)}`);
    console.log(
      `${
        quarterlyResult.unrealizedPnL >= 0 ? "🟢" : "🔴"
      } P&L: $${quarterlyResult.unrealizedPnL.toFixed(
        2
      )} (${quarterlyResult.unrealizedPnLPercentage.toFixed(2)}%)`
    );
  } else {
    console.log("❌ No se encontraron posiciones de VISA");
  }
}

main();
