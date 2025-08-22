import { CashBasedMovement, Currency, MovementType } from "./movement";

export class DividendMovement extends CashBasedMovement {
  constructor(
    id: string,
    public grossAmount: number,
    public taxWithheld: number = 0,
    symbol: string,
    currency: Currency = "USD",
    date: Date = new Date(),
    description?: string
  ) {
    const netAmount = grossAmount - taxWithheld;
    super(id, netAmount, currency, date, symbol, description);
  }

  getMovementType(): MovementType {
    return "DIVIDEND";
  }

  getTaxWithheld(): number {
    return this.taxWithheld;
  }

  getNetAmount(): number {
    return this.amount;
  }

  validate(): boolean {
    if (!super.validate()) {
      return false;
    }

    if (!this.symbol) {
      console.error("Symbol is required for dividend movements");
      return false;
    }

    if (this.taxWithheld <= 0) {
      console.error("Tax withheld cannot be negative");
      return false;
    }

    if (this.taxWithheld > this.grossAmount) {
      console.error("Tax withheld cannot exceed gross amount");
      return false;
    }

    return true;
  }

  getDisplayInfo(): string {
    const taxInfo =
      this.taxWithheld > 0 ? `(Tax: $${this.taxWithheld.toFixed(2)})` : "";
    return `${this.getMovementType()}: $${this.grossAmount.toFixed(
      2
    )} ${taxInfo} -> Net Amount: $${this.getNetAmount().toFixed(2)} @ ${
      this.symbol
    }`;
  }
}
