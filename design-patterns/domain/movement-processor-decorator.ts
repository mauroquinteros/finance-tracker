import { Movement } from "./movement";
import { MovementProcessor } from "./movement-processor";

export abstract class MovementProcessorDecorator implements MovementProcessor {
  constructor(protected processor: MovementProcessor) {}

  async process(movement: Movement): Promise<void> {
    await this.processor.process(movement);
  }
}

export interface ProcessingLog {
  timestamp: Date;
  movementId: string;
  movementType: string;
  action: "STARTED" | "COMPLETED" | "FAILED";
  details: string;
  processingTime?: number;
  success: boolean;
}

export class LoggingMovementDecorator extends MovementProcessorDecorator {
  private logs: ProcessingLog[] = [];

  async process(movement: Movement): Promise<void> {
    const startTime = Date.now();

    this.addLog(movement, "STARTED", "Processing started", 0, true);
    console.log(
      `📝 [LOG] Started processing ${movement.getMovementType()} ${movement.id}`
    );

    try {
      await super.process(movement);
      const processingTime = Date.now() - startTime;
      this.addLog(
        movement,
        "COMPLETED",
        "Processing completed successfully",
        processingTime,
        true
      );
      console.log(
        `📝 [LOG] ✅ Completed ${movement.id} in ${processingTime}ms`
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.addLog(
        movement,
        "FAILED",
        `Processing failed: ${errorMessage}`,
        processingTime,
        false
      );
      console.error(`📝 [LOG] ❌ Failed ${movement.id}: ${errorMessage}`);
      throw error;
    }
  }

  private addLog(
    movement: Movement,
    action: "STARTED" | "COMPLETED" | "FAILED",
    details: string,
    processingTime: number,
    success: boolean
  ): void {
    this.logs.push({
      timestamp: new Date(),
      movementId: movement.id,
      movementType: movement.getMovementType(),
      action,
      details,
      processingTime,
      success,
    });
  }

  getAllLogs(): ProcessingLog[] {
    return [...this.logs];
  }

  getLogsForMovement(movementId: string): ProcessingLog[] {
    return this.logs.filter((log) => log.movementId === movementId);
  }

  getErrorLogs(): ProcessingLog[] {
    return this.logs.filter((log) => !log.success);
  }

  getProcessingStats(): {
    totalProcessed: number;
    successful: number;
    failed: number;
    averageProcessingTime: number;
    successRate: number;
  } {
    const completedLogs = this.logs.filter(
      (log) => log.action === "COMPLETED" || log.action === "FAILED"
    );
    const successful = this.logs.filter(
      (log) => log.action === "COMPLETED"
    ).length;
    const failed = this.logs.filter((log) => log.action === "FAILED").length;

    const processingTimes = this.logs
      .filter(
        (log) => log.processingTime !== undefined && log.processingTime > 0
      )
      .map((log) => log.processingTime!);

    const averageProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((sum, time) => sum + time, 0) /
          processingTimes.length
        : 0;

    return {
      totalProcessed: completedLogs.length,
      successful,
      failed,
      averageProcessingTime: Math.round(averageProcessingTime),
      successRate:
        completedLogs.length > 0
          ? (successful / completedLogs.length) * 100
          : 0,
    };
  }

  exportLogsAsJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs(): void {
    this.logs = [];
    console.log("📝 [LOG] All logs cleared");
  }
}

export class ValidationMovementDecorator extends MovementProcessorDecorator {
  private validationRules: Array<(movement: Movement) => string | null> = [];
  private processedIds = new Set<string>();

  constructor(processor: MovementProcessor) {
    super(processor);
    this.setupDefaultRules();
  }

  async process(movement: Movement): Promise<void> {
    for (const rule of this.validationRules) {
      const error = rule(movement);
      if (error) {
        console.log(`🔍 [VALIDATION] ❌ Rule failed: ${error}`);
        throw new Error(`Validation failed: ${error}`);
      }
    }
    console.log(`🔍 [VALIDATION] ✅ All rules passed for ${movement.id}`);
    await super.process(movement);
  }

  private setupDefaultRules(): void {
    // Rule 1: No IDs duplicados en esta sesión
    this.validationRules.push((movement) => {
      if (this.processedIds.has(movement.id)) {
        return `Duplicate movement ID in this session: ${movement.id}`;
      }
      this.processedIds.add(movement.id);
      return null;
    });

    // Rule 2: Fecha no puede ser en el futuro
    this.validationRules.push((movement) => {
      if (movement.date > new Date()) {
        return `Movement date cannot be in the future: ${
          movement.id
        } (${movement.date.toISOString()})`;
      }
      return null;
    });

    // Rule 3: Validaciones específicas para ShareBasedMovement
    this.validationRules.push((movement) => {
      if (
        movement.getMovementType() === "STOCK" ||
        movement.getMovementType() === "CRYPTO"
      ) {
        const shareMovement = movement as any;
        if (
          shareMovement.investedAmount &&
          shareMovement.investedAmount > 50000
        ) {
          return `Investment amount seems unusually high: $${shareMovement.investedAmount} for ${movement.id}`;
        }
      }
      return null;
    });
  }
}
