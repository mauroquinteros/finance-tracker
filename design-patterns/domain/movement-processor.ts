import { MovementFactory } from "../movement-factory";
import { Movement, MovementType } from "./movement";
import {
  LoggingMovementDecorator,
  ValidationMovementDecorator,
} from "./movement-processor-decorator";
import { MovementData } from "./movement.interface";

export interface MovementProcessor {
  process(movement: Movement): Promise<void>;
}

export class BaseMovementProcessor implements MovementProcessor {
  async process(movement: Movement): Promise<void> {
    // 1. Validación usando el método validate() de tu Movement
    if (!movement.validate()) {
      throw new Error(`Invalid movement: ${movement.id}`);
    }

    // 2. Simular procesamiento real (aquí irían operaciones como guardar en DB)
    await this.simulateBusinessLogic();

    console.log(movement.getDisplayInfo());
    console.log(`✅ Movement processed successfully`);
  }

  private async simulateBusinessLogic(): Promise<void> {
    // Simular delay de procesamiento real
    await new Promise((resolve) =>
      setTimeout(resolve, 20 + Math.random() * 80)
    );
  }
}

export class MovementService {
  private processor: MovementProcessor;

  constructor(useFullFeatures: boolean = false) {
    const processor = new BaseMovementProcessor();
    if (useFullFeatures) {
      this.processor = new LoggingMovementDecorator(
        new ValidationMovementDecorator(processor)
      );
    } else {
      this.processor = processor;
    }
  }

  async processMovement(type: MovementType, data: MovementData): Promise<void> {
    const movement = MovementFactory.createMovement(type, data);
    await this.processor.process(movement);
  }

  async processMovements(
    movements: Array<{
      type: MovementType;
      data: MovementData;
    }>
  ): Promise<void> {
    for (const { type, data } of movements) {
      await this.processMovement(type, data);
    }
  }
}
