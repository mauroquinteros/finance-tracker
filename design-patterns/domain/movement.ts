export type MovementType =
  | "STOCK"
  | "CRYPTO"
  | "DIVIDEND"
  | "DEPOSIT"
  | "WITHDRAWAL";

export type Currency = "USD" | "PEN";

export interface Movement {
  id: string;
  date: Date;
  description?: string;

  validate(): boolean;
  getMovementType(): MovementType;
  getDisplayInfo(): string;
}

export abstract class ShareBasedMovement implements Movement {
  constructor(
    public id: string,
    public symbol: string,
    public investedAmount: number,
    public price: number,
    public fee: number,
    public date: Date = new Date(),
    public description?: string
  ) {}

  validate(): boolean {
    if (!this.id || !this.symbol) {
      console.error("ID and symbol are required");
      return false;
    }

    if (this.investedAmount <= 0) {
      console.error("Invested amount must be positive");
      return false;
    }

    if (this.price <= 0) {
      console.error("Price must be positive");
      return false;
    }

    if (this.fee <= 0) {
      console.error("Fee must be positive");
      return false;
    }

    return true;
  }

  getQuantity(): number {
    return this.investedAmount / this.price;
  }

  getDisplayInfo(): string {
    return `${this.getMovementType()}: $${this.investedAmount.toFixed(
      2
    )} (Fee: $${this.fee.toFixed(2)}) -> ${this.getQuantity().toFixed(
      5
    )} ${this.getQuantityUnit()} of ${this.symbol} @ $${this.price.toFixed(2)}`;
  }

  abstract getMovementType(): MovementType;
  abstract getQuantityUnit(): string;
}

export abstract class CashBasedMovement implements Movement {
  constructor(
    public id: string,
    public amount: number,
    public currency: Currency = "USD",
    public date: Date = new Date(),
    public symbol?: string,
    public description?: string
  ) {}

  validate(): boolean {
    if (!this.id) {
      console.error("ID is required");
      return false;
    }

    if (this.amount <= 0) {
      console.error("Amount must be positive");
      return false;
    }

    if (!this.currency) {
      console.error("Currency is required");
      return false;
    }

    return true;
  }

  abstract getDisplayInfo(): string;
  abstract getMovementType(): MovementType;
}
