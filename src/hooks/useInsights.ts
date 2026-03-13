import { useMemo } from "react";
import type { Position } from "@/types/portfolio.js";
import { computePortfolioInsights } from "@/utils/insightsCalculator.js";
import type { PortfolioInsights } from "@/types/insights.js";

/**
 * Compute portfolio insights (diversification score + alerts) from positions.
 */
export function useInsights(positions: Position[]): PortfolioInsights {
  return useMemo(() => computePortfolioInsights(positions), [positions]);
}
