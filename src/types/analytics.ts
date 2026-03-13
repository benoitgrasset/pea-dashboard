import type { Position } from "./portfolio.js";

/** Data point for pie chart (position or sector). */
export interface PieDataPoint {
  name: string;
  value: number;
  fill?: string;
}

/** Bar chart item: position name + performance. */
export interface BarDataPoint {
  name: string;
  value: number;
  fill?: string;
  variation?: number;
}

/** Geographic allocation. */
export interface GeoAllocation {
  region: string;
  value: number;
  weight: number;
  fill?: string;
}

/** Sector allocation (derived from positions). */
export interface SectorAllocation {
  sector: string;
  value: number;
  weight: number;
  fill?: string;
}

/** Precomputed analytics for charts (memoized). */
export interface PortfolioAnalytics {
  byPosition: PieDataPoint[];
  bySector: SectorAllocation[];
  byRegion: GeoAllocation[];
  performanceBars: BarDataPoint[];
  positions: Position[];
  totalValue: number;
}
