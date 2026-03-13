/** Severity of an insight (alert). */
export type InsightSeverity = "info" | "warning" | "error" | "success";

/** Single portfolio insight (concentration, sector, redundancy, etc.). */
export interface PortfolioInsight {
  id: string;
  type: "concentration" | "sector" | "redundancy" | "geography" | "diversification";
  severity: InsightSeverity;
  title: string;
  description: string;
  detail?: string;
  value?: number;
  recommendation?: string;
  relatedPositions?: string[];
}

/** Diversification score 0–100. */
export interface DiversificationScore {
  score: number;
  label: string;
  description: string;
  breakdown?: {
    concentration: number;
    sector: number;
    geography: number;
    redundancy: number;
  };
}

/** Full insights result. */
export interface PortfolioInsights {
  score: DiversificationScore;
  insights: PortfolioInsight[];
  regionExposure: { region: string; weight: number }[];
  sectorExposure: { sector: string; weight: number }[];
}
