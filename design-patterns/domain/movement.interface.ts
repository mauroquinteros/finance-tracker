import { DepositMethod } from "./deposit-movement";
import { Currency } from "./movement";

export interface ShareMovementData {
  id: string;
  symbol: string;
  investedAmount: number;
  price: number;
  fee: number;
  date?: Date;
  description?: string;
}

export interface DividendMovementData {
  id: string;
  grossAmount: number;
  taxWithheld: number;
  symbol: string;
  currency?: Currency;
  date?: Date;
  description?: string;
}

export interface DepositMovementData {
  id: string;
  grossAmount: number;
  fee: number;
  depositMethod: DepositMethod;
  currency?: Currency;
  date?: Date;
  description?: string;
}

export type MovementData =
  | ShareMovementData
  | DividendMovementData
  | DepositMovementData;
