import { MovementType, ShareBasedMovement } from "./movement";

export class CryptoMovement extends ShareBasedMovement {
  getMovementType(): MovementType {
    return "CRYPTO";
  }

  getQuantityUnit(): string {
    return "coins";
  }
}
