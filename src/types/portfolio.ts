/**
 * Raw row from CSV (semicolon-separated).
 * Format étendu : name;isin;quantity;buyingPrice;lastPrice;intradayVariation;amount;amountVariation;variation;lastMovementDate;compensation
 */
export interface CsvRow {
  name: string;
  isin: string;
  quantity: string;
  buyingPrice: string;
  lastPrice: string;
  amount: string;
  variation: string;
  /** Variation en € (si présent dans le CSV) */
  amountVariation?: string;
  /** Date du dernier mouvement (optionnel) */
  lastMovementDate?: string;
}

/** Normalized position after parsing and validation. */
export interface Position {
  id: string;
  name: string;
  isin: string;
  quantity: number;
  buyingPrice: number;
  lastPrice: number;
  amount: number;
  variation: number; // percentage
  variationAmount: number; // €
  sector?: string;
  region?: string;
  weight: number; // % of portfolio
  /** Date du dernier mouvement (si fournie par le CSV) */
  lastMovementDate?: string;
}

/** Portfolio state: list of positions + computed totals. */
export interface Portfolio {
  positions: Position[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  lastUpdated: string; // ISO date
}

/** Sort key for positions table. */
export type PositionSortKey =
  | "name"
  | "amount"
  | "variation"
  | "weight"
  | "quantity"
  | "lastPrice";

export type SortDirection = "asc" | "desc";
