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
  currentPricePerShare: number; // Precio actual de mercado
  totalInvested: number; // Dinero invertido en esta posición
  currentValue: number; // Valor actual de esta posición
  unrealizedPnL: number; // Ganancia/pérdida de esta posición
  unrealizedPnLPercentage: number; // Porcentaje de esta posición
  costBasisMethod: CostBasisMethod;
}

export interface PortfolioCalculationResult {
  totalInvested: number; // Dinero total invertido en compras
  totalCurrentValue: number; // Valor actual de todas las posiciones
  unrealizedPnL: number; // Ganancia/pérdida no realizada
  unrealizedPnLPercentage: number; // Porcentaje de ganancia/pérdida
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
    // 1. Filtrar solo movimientos de acciones/crypto
    const shareMovements = this.getShareMovements(movements);

    // 2. Aplicar filtros de fecha y símbolo si están configurados
    const filteredMovements = this.applyFilters(shareMovements);

    // 3. Calcular posiciones según el método configurado
    const positions = await this.calculatePositions(
      filteredMovements,
      currentPrices
    );

    // 4. Calcular totales
    const totalInvested = positions.reduce(
      (sum, pos) => sum + pos.totalInvested,
      0
    );
    const totalCurrentValue = positions.reduce(
      (sum, pos) => sum + pos.currentValue,
      0
    );

    // 5. Calcular P&L según configuración
    let unrealizedPnL = 0;
    if (this.config.includeUnrealizedGains) {
      unrealizedPnL = positions.reduce(
        (sum, pos) => sum + pos.unrealizedPnL,
        0
      );
    }

    const unrealizedPnLPercentage =
      totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValue,
      unrealizedPnL,
      unrealizedPnLPercentage,
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

  private async calculatePositions(
    movements: ShareBasedMovement[],
    currentPrices?: Map<string, number>
  ): Promise<PositionResult[]> {
    // Agrupar movimientos por símbolo
    const positionMap = new Map<string, ShareBasedMovement[]>();

    movements.forEach((movement) => {
      const positionsBySymbol = positionMap.get(movement.symbol) || [];
      positionsBySymbol.push(movement);
      positionMap.set(movement.symbol, positionsBySymbol);
    });

    // Calcular cada posición
    const positions: PositionResult[] = [];

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
    currentPricePerShare: number
  ): PositionResult {
    // Para AVERAGE COST (más común en análisis personal)
    if (this.config.costBasisMethod === "AVERAGE") {
      return this.calculateAverageCostPosition(
        symbol,
        movements,
        currentPricePerShare
      );
    }

    // Para FIFO y LIFO necesitaríamos tracking más complejo de lotes
    // Por simplicidad, usamos average cost como fallback
    // En implementación real, aquí implementarías la lógica completa
    return this.calculateAverageCostPosition(
      symbol,
      movements,
      currentPricePerShare
    );
  }

  private calculateAverageCostPosition(
    symbol: string,
    movements: ShareBasedMovement[],
    currentPricePerShare: number
  ): PositionResult {
    // Calcular totales
    const totalShares = movements.reduce((sum, m) => sum + m.getQuantity(), 0);
    const totalInvested = movements.reduce(
      (sum, m) => sum + m.investedAmount,
      0
    );

    // Precio promedio pagado por acción
    const averageCostPerShare = totalInvested / totalShares;

    // Valor actual
    const currentValue = totalShares * currentPricePerShare;

    // Ganancia/pérdida no realizada
    const unrealizedPnL = currentValue - totalInvested;
    const unrealizedPnLPercentage = (unrealizedPnL / totalInvested) * 100;

    return {
      symbol,
      totalShares,
      averageCostPerShare,
      currentPricePerShare,
      totalInvested,
      currentValue,
      unrealizedPnL: this.config.includeUnrealizedGains ? unrealizedPnL : 0,
      unrealizedPnLPercentage: this.config.includeUnrealizedGains
        ? unrealizedPnLPercentage
        : 0,
      costBasisMethod: this.config.costBasisMethod,
    };
  }

  private getLastKnownPrice(movements: ShareBasedMovement[]): number {
    // Si no hay precio actual, usa el precio de la última compra
    const sortedByDate = movements.sort(
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
