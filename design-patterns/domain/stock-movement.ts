import { MovementType, ShareBasedMovement } from "./movement";

export class StockMovement extends ShareBasedMovement {
  getMovementType(): MovementType {
    return "STOCK";
  }

  getQuantityUnit(): string {
    return "shares";
  }
}
