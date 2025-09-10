import {
  CostBasisMethod,
  PortfolioCalculationConfig,
  PortfolioCalculator,
} from "./portfolio-calculator";

export class PortfolioCalculatorBuilder {
  private config: Partial<PortfolioCalculationConfig> = {
    costBasisMethod: "AVERAGE", // Default más simple para uso personal
    includeUnrealizedGains: true, // Default ver ganancias "en papel"
  };

  /**
   * Establecer método de cost basis para cálculos
   *
   * @param method - Método de cálculo:
   *   - "AVERAGE": Promedia precio de todas las compras (más simple para análisis personal)
   *   - "FIFO": First In, First Out - vendes las más antiguas primero (tax planning)
   *   - "LIFO": Last In, First Out - vendes las más recientes primero (mercados bajistas)
   *
   * Ejemplo AVERAGE: Compraste AAPL a $100, $150, $200 → Precio promedio = $150
   */
  setCostBasisMethod(method: CostBasisMethod): this {
    this.config.costBasisMethod = method;
    return this;
  }

  /**
   * Incluir ganancias no realizadas (posiciones que aún tienes)
   *
   * true = Cuenta ganancias "en papel" (default para análisis personal)
   * false = Solo cuenta cuando vendas realmente
   */
  setIncludeUnrealizedGains(isIncluded: boolean = true): this {
    this.config.includeUnrealizedGains = isIncluded;
    return this;
  }

  /**
   * Establecer rango de fechas para el análisis
   *
   * @param startDate - Fecha de inicio (opcional). Si no se especifica, incluye desde el principio
   * @param endDate - Fecha de fin (opcional). Si no se especifica, incluye hasta ahora
   *
   * Ejemplos:
   * - setDateRange(jan1, mar31) → Solo Q1 2024
   * - setDateRange(jan1) → Desde enero hasta ahora
   * - setDateRange(undefined, mar31) → Desde el principio hasta marzo
   */
  setDateRange(startDate?: Date, endDate?: Date): this {
    this.config.startDate = startDate;
    this.config.endDate = endDate;
    return this;
  }

  /**
   * Analizar solo una acción específica
   * Ejemplo: "¿Cómo va mi posición en AAPL?"
   */
  setSymbol(symbol: string): this {
    this.config.targetSymbol = symbol.toUpperCase();
    return this;
  }

  /**
   * Construir el calculator con la configuración definida
   */
  build(): PortfolioCalculator {
    return new PortfolioCalculator(this.config as PortfolioCalculationConfig);
  }
}
