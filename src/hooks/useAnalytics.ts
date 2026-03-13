import { useMemo } from "react";
import type { Position } from "@/types/portfolio.js";
import type {
  BarDataPoint,
  GeoAllocation,
  PieDataPoint,
  SectorAllocation,
} from "@/types/analytics.js";

const CHART_COLORS = [
  "hsl(163, 72%, 42%)", // primary
  "hsl(199, 89%, 48%)",
  "hsl(262, 83%, 58%)",
  "hsl(38, 92%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(330, 81%, 60%)",
  "hsl(0, 72%, 51%)",
  "hsl(180, 70%, 45%)",
];

function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Compute all chart-ready data from positions (memoized).
 */
export function useAnalytics(positions: Position[], totalValue: number) {
  const byPosition: PieDataPoint[] = useMemo(() => {
    if (totalValue <= 0) return [];
    return positions.map((p, i) => ({
      name: p.name.length > 25 ? `${p.name.slice(0, 22)}…` : p.name,
      value: Math.round(p.amount * 100) / 100,
      fill: getColor(i),
    }));
  }, [positions, totalValue]);

  const bySector: SectorAllocation[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of positions) {
      const s = p.sector ?? "Non classé";
      map.set(s, (map.get(s) ?? 0) + p.amount);
    }
    let i = 0;
    return Array.from(map.entries()).map(([sector, value]) => ({
      sector,
      value,
      weight: totalValue > 0 ? (value / totalValue) * 100 : 0,
      fill: getColor(i++),
    }));
  }, [positions, totalValue]);

  const byRegion: GeoAllocation[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of positions) {
      const r = p.region ?? "Other";
      map.set(r, (map.get(r) ?? 0) + p.amount);
    }
    let i = 0;
    return Array.from(map.entries()).map(([region, value]) => ({
      region,
      value,
      weight: totalValue > 0 ? (value / totalValue) * 100 : 0,
      fill: getColor(i++),
    }));
  }, [positions, totalValue]);

  const performanceBars: BarDataPoint[] = useMemo(() => {
    return positions
      .map((p) => ({
        name: p.name.length > 20 ? `${p.name.slice(0, 18)}…` : p.name,
        value: p.variationAmount,
        variation: p.variation,
        fill: p.variationAmount >= 0 ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)",
      }))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [positions]);

  return {
    byPosition,
    bySector,
    byRegion,
    performanceBars,
  };
}
