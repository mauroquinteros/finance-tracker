import { CashBasedMovement, Currency, MovementType } from "./movement";

export type DepositMethod = "BANK_TRANSFER" | "AIRTM" | "WIRE";

export class DepositMovement extends CashBasedMovement {
  constructor(
    id: string,
    public grossAmount: number,
    public fee: number,
    public depositMethod: DepositMethod,
    currency: Currency = "USD",
    date: Date = new Date(),
    description?: string
  ) {
    const netAmount = grossAmount - fee;
    super(id, netAmount, currency, date, undefined, description);
  }

  getMovementType(): MovementType {
    return "DEPOSIT";
  }

  getNetAmount(): number {
    return this.amount;
  }

  validate(): boolean {
    if (!super.validate()) {
      return false;
    }

    if (this.grossAmount <= 0) {
      console.error("Gross amount cannot be negative");
      return false;
    }

    if (this.fee <= 0) {
      console.error("Fee amount cannot be negative");
      return false;
    }

    return true;
  }

  getDisplayInfo(): string {
    const feeInfo = this.fee > 0 ? `(Fee: $${this.fee.toFixed(2)})` : "";
    return `${this.getMovementType()}: $${this.grossAmount.toFixed(
      2
    )} ${feeInfo} -> Net Amount: $${this.getNetAmount().toFixed(2)} via ${
      this.depositMethod
    }`;
  }
}
