import { MovementType } from "./domain/movement";
import { MovementData } from "./domain/movement.interface";
import { MovementService } from "./domain/movement-processor";
import { PortfolioCalculatorBuilder } from "./domain/portfolio-builder";
import { StockProvider } from "./domain/price-provider";
import { MovementFactory } from "./movement-factory";
import {
  AlphaVantageAdapter,
  AlphaVantageApi,
} from "./services/alpha-vantage-provider";
import {
  YahooFinanceAdatper,
  YahooFinanceApi,
} from "./services/yahoo-provider";

async function main() {
  console.log("\nFACTORY METHOD AND MOVEMENT PROCESSOR - DEMO BÁSICA\n");

  const movementService = new MovementService(true);

  const movementsData: { type: MovementType; data: MovementData }[] = [
    {
      type: "STOCK",
      data: {
        id: "stock001",
        symbol: "AAPL",
        investedAmount: 200,
        price: 201.92,
        fee: 0.15,
      },
    },
    {
      type: "STOCK",
      data: {
        id: "stock002",
        symbol: "AAPL",
        investedAmount: 200,
        price: 201.92,
        fee: 0.15,
      },
    },
    {
      type: "CRYPTO",
      data: {
        id: "crypto001",
        symbol: "BTCUSD",
        investedAmount: 861.5,
        price: 95815.8,
        fee: 8.62,
      },
    },
    {
      type: "DIVIDEND",
      data: {
        id: "div001",
        symbol: "VOO",
        grossAmount: 8.0,
        taxWithheld: 2.4,
      },
    },
    {
      type: "DEPOSIT",
      data: {
        id: "dep001",
        grossAmount: 706.3,
        fee: 6.3,
        depositMethod: "BANK_TRANSFER",
      },
    },
  ];

  console.log("🔄 Processing movements with full logging:\n");

  try {
    await movementService.processMovements(movementsData);
    console.log("\n📊 Processing completed successfully!");
  } catch (error) {
    console.error("❌ Processing failed:", error);
  }

  console.log("\n\nPORTFOLIO CALCULATOR BUILDER - DEMO COMPLETA\n");

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

  const provider: StockProvider = new YahooFinanceAdatper(
    new YahooFinanceApi()
  );
  // const provider: StockProvider = new AlphaVantageAdapter(new AlphaVantageApi())
  const currentProviderData = await provider.getBatchStockData(["V", "AXP"]);

  const providerPrices = currentProviderData.map((data) => [
    data.symbol,
    data.price,
  ]) as [string, number][];
  const currentPrices = new Map(providerPrices);

  console.log("\n📊 ANÁLISIS BÁSICO DEL PORTFOLIO\n");

  const basicCalculator = new PortfolioCalculatorBuilder().build();
  const basicResult = await basicCalculator.calculate(movements, currentPrices);

  console.log(`💰 Total Invertido: $${basicResult.totalInvested.toFixed(2)}`);
  console.log(`📈 Valor Actual: $${basicResult.totalCurrentValue.toFixed(2)}`);
  console.log(
    `${
      basicResult.totalUnrealizedPnL >= 0 ? "🟢" : "🔴"
    } P&L: $${basicResult.totalUnrealizedPnL.toFixed(
      2
    )} (${basicResult.totalUnrealizedPnLPercentage.toFixed(2)}%)`
  );
  console.log(`📋 Método: ${basicResult.calculationMethod}`);
  console.log(`📅 Periodo: ${basicResult.calculationPeriod}\n`);

  console.log("\nANÁLISIS DE VISA ESPECÍFICAMENTE\n");
  const stockCalculator = new PortfolioCalculatorBuilder()
    .setSymbol("V")
    .build();
  const stockResult = await stockCalculator.calculate(movements, currentPrices);

  if (stockResult.positions.length > 0) {
    const position = stockResult.positions[0];
    console.log(`Posición en VISA:`);
    console.log(`Shares: ${position.totalShares.toFixed(5)}`);
    console.log(`Total Invertido: $${stockResult.totalInvested.toFixed(2)}`);
    console.log(
      `Precio Promedio Pagado: $${position.averageCostPerShare.toFixed(2)}`
    );
    console.log(`Precio Actual: $${position.currentPrice.toFixed(2)}`);
    console.log(
      `${
        stockResult.totalUnrealizedPnL >= 0 ? "🟢" : "🔴"
      } P&L: $${stockResult.totalUnrealizedPnL.toFixed(
        2
      )} (${stockResult.totalUnrealizedPnLPercentage.toFixed(2)}%)`
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
    console.log(`Precio Actual: $${position.currentPrice.toFixed(2)}`);
    console.log(
      `${
        quarterlyResult.totalUnrealizedPnL >= 0 ? "🟢" : "🔴"
      } P&L: $${quarterlyResult.totalUnrealizedPnL.toFixed(
        2
      )} (${quarterlyResult.totalUnrealizedPnLPercentage.toFixed(2)}%)`
    );
  } else {
    console.log("❌ No se encontraron posiciones de VISA");
  }
}

main();
