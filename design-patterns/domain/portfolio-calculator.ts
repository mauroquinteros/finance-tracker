import { Movement, ShareBasedMovement } from "./movement";

export type CostBasisMethod = "FIFO" | "LIFO" | "AVERAGE";

export interface PortfolioCalculationConfig {
  costBasisMethod: CostBasisMethod;
  includeUnrealizedGains: boolean;
  startDate?: Date;
  endDate?: Date;
  targetSymbol?: string; // Para analizar una acción específica
}

export interface PositionResult {
  symbol: string;
  totalShares: number;
  averageCostPerShare: number; // Precio promedio que pagaste
  currentPrice: number; // Precio actual de mercado
  totalInvested: number; // Dinero invertido en esta posición
  currentValue: number; // Valor actual de esta posición
  unrealizedPnL: number; // Ganancia/pérdida de esta posición
  unrealizedPnLPercentage: number; // Porcentaje de esta posición
  costBasisMethod: CostBasisMethod;
}

// TODO: review the fields for this interface
export interface PortfolioCalculationResult {
  totalInvested: number; // Dinero total invertido en compras
  totalCurrentValue: number; // Valor actual de todas las posiciones
  totalUnrealizedPnL: number; // Ganancia/pérdida no realizada
  totalUnrealizedPnLPercentage: number; // Porcentaje de ganancia/pérdida
  positions: PositionResult[]; // Detalle por cada acción
  calculationMethod: string; // Descripción del método usado
  calculationPeriod: string; // Periodo analizado
  calculationDate: Date; // Cuándo se hizo el cálculo
}

export class PortfolioCalculator {
  constructor(private config: PortfolioCalculationConfig) {}

  async calculate(
    movements: Movement[],
    currentPrices?: Map<string, number>
  ): Promise<PortfolioCalculationResult> {
    // 1. Filter to allow only stocks and cryptos movements
    const shareMovements = this.getShareMovements(movements);

    // 2. Apply filter for dates and symbol if they're present
    const filteredMovements = this.applyFilters(shareMovements);

    // 3. Calculate positions based on the cost basis method
    const positions = await this.calculatePositions(
      filteredMovements,
      currentPrices
    );

    // 4. Calculate total values
    const {
      totalInvested,
      totalCurrentValue,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercentage,
    } = this.calculatePortfolio(positions);

    return {
      totalInvested,
      totalCurrentValue,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercentage,
      positions,
      calculationMethod: this.getMethodDescription(),
      calculationPeriod: this.getPeriodDescription(),
      calculationDate: new Date(),
    };
  }

  private getShareMovements(movements: Movement[]): ShareBasedMovement[] {
    return movements.filter(
      (movement) =>
        movement.getMovementType() === "STOCK" ||
        movement.getMovementType() === "CRYPTO"
    ) as ShareBasedMovement[];
  }

  private applyFilters(movements: ShareBasedMovement[]): ShareBasedMovement[] {
    let filteredMovements = [...movements];

    // Filtro por fechas
    if (this.config.startDate || this.config.endDate) {
      filteredMovements = filteredMovements.filter((movement) => {
        if (this.config.startDate && movement.date < this.config.startDate) {
          return false;
        }
        if (this.config.endDate && movement.date > this.config.endDate) {
          return false;
        }
        return true;
      });
    }

    // Filtro por símbolo específico
    if (this.config.targetSymbol) {
      filteredMovements = filteredMovements.filter(
        (movement) => movement.symbol === this.config.targetSymbol
      );
    }

    return filteredMovements;
  }

  private calculatePortfolio(positions: PositionResult[]) {
    const totalInvested = positions.reduce((sum, pos) => {
      const v = Number(pos.totalInvested) || 0;
      return sum + v;
    }, 0);

    const totalCurrentValue = positions.reduce((sum, pos) => {
      const v = Number(pos.currentValue) || 0;
      return sum + v;
    }, 0);

    const totalUnrealizedPnL = this.config.includeUnrealizedGains
      ? positions.reduce((sum, pos) => {
          const v = Number(pos.unrealizedPnL) || 0;
          return sum + v;
        }, 0)
      : 0;

    const totalUnrealizedPnLPercentage =
      totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercentage,
    };
  }

  private async calculatePositions(
    movements: ShareBasedMovement[],
    currentPrices?: Map<string, number>
  ): Promise<PositionResult[]> {
    // 1. Group movements by symbol
    const positionMap = new Map<string, ShareBasedMovement[]>();

    movements.forEach((movement) => {
      const positionsBySymbol = positionMap.get(movement.symbol) || [];
      positionsBySymbol.push(movement);
      positionMap.set(movement.symbol, positionsBySymbol);
    });

    const positions: PositionResult[] = [];

    // 2. Calculate position for each symbol
    for (const [symbol, symbolMovements] of positionMap.entries()) {
      const currentPrice =
        currentPrices?.get(symbol) || this.getLastKnownPrice(symbolMovements);

      const position = this.calculatePositionByMethod(
        symbol,
        symbolMovements,
        currentPrice
      );

      positions.push(position);
    }

    return positions;
  }

  private calculatePositionByMethod(
    symbol: string,
    movements: ShareBasedMovement[],
    currentPrice: number
  ): PositionResult {
    // for Average Cost (mostly common for personal analysis)
    if (this.config.costBasisMethod === "AVERAGE") {
      return this.calculateAverageCostPosition(symbol, movements, currentPrice);
    }

    // Para FIFO y LIFO necesitaríamos tracking más complejo de lotes
    // Por simplicidad, usamos average cost como fallback
    // En implementación real, aquí implementarías la lógica completa
    return this.calculateAverageCostPosition(symbol, movements, currentPrice);
  }

  private calculateAverageCostPosition(
    symbol: string,
    movements: ShareBasedMovement[],
    currentPrice: number
  ): PositionResult {
    const totalShares = movements.reduce((sum, m) => sum + m.getQuantity(), 0);
    const totalInvested = movements.reduce(
      (sum, m) => sum + m.investedAmount,
      0
    );

    // Guard against division by zero / invalid numbers
    const averageCostPerShare =
      totalShares > 0 ? totalInvested / totalShares : 0;

    const currentValue = totalShares * (Number(currentPrice) || 0);

    const unrealizedPnL = this.config.includeUnrealizedGains
      ? currentValue - totalInvested
      : 0;
    const unrealizedPnLPercentage =
      this.config.includeUnrealizedGains && totalInvested > 0
        ? (unrealizedPnL / totalInvested) * 100
        : 0;

    return {
      symbol,
      totalShares,
      averageCostPerShare,
      currentPrice,
      totalInvested,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercentage,
      costBasisMethod: this.config.costBasisMethod,
    };
  }

  private getLastKnownPrice(movements: ShareBasedMovement[]): number {
    // Don't mutate input array; copy before sorting
    const sortedByDate = [...movements].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    return sortedByDate[0]?.price || 0;
  }

  private getMethodDescription(): string {
    const method = this.config.costBasisMethod;
    const unrealized = this.config.includeUnrealizedGains
      ? " + Unrealized P&L"
      : " (Realized Only)";
    return `${method} Cost Basis${unrealized}`;
  }

  private getPeriodDescription(): string {
    if (this.config.startDate && this.config.endDate) {
      return `${this.config.startDate.toDateString()} to ${this.config.endDate.toDateString()}`;
    }
    if (this.config.startDate) {
      return `Since ${this.config.startDate.toDateString()}`;
    }
    if (this.config.endDate) {
      return `Until ${this.config.endDate.toDateString()}`;
    }
    if (this.config.targetSymbol) {
      return `${this.config.targetSymbol} Only`;
    }
    return "All Time";
  }
}
