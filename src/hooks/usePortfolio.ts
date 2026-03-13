import { useCallback, useMemo, useState } from "react";
import type { Portfolio, PositionSortKey, SortDirection } from "@/types/portfolio.js";
import { parseCsv, type ParseCsvResult } from "@/utils/csvParser.js";

const DEFAULT_PORTFOLIO: Portfolio = {
  positions: [],
  totalValue: 0,
  totalCost: 0,
  totalGainLoss: 0,
  totalGainLossPercent: 0,
  lastUpdated: new Date().toISOString(),
};

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio>(DEFAULT_PORTFOLIO);
  const [parseError, setParseError] = useState<string | null>(null);
  const [sort, setSortState] = useState<{
    key: PositionSortKey;
    dir: SortDirection;
  }>({ key: "amount", dir: "desc" });
  const [filterQuery, setFilterQuery] = useState("");

  const loadFromCsv = useCallback((csvString: string) => {
    setParseError(null);
    const result: ParseCsvResult = parseCsv(csvString);
    if (!result.success) {
      setParseError(result.message);
      setPortfolio(DEFAULT_PORTFOLIO);
      return;
    }
    const totalCost = result.positions.reduce((s, p) => s + p.quantity * p.buyingPrice, 0);
    const totalGainLoss = result.totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    setPortfolio({
      positions: result.positions,
      totalValue: result.totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      lastUpdated: new Date().toISOString(),
    });
  }, []);

  const clearPortfolio = useCallback(() => {
    setPortfolio(DEFAULT_PORTFOLIO);
    setParseError(null);
    setFilterQuery("");
  }, []);

  const clearParseError = useCallback(() => {
    setParseError(null);
  }, []);

  const setSort = useCallback((key: PositionSortKey) => {
    setSortState((prev) => ({
      key,
      dir:
        prev.key === key
          ? prev.dir === "asc"
            ? "desc"
            : "asc"
          : "desc",
    }));
  }, []);

  const sortedAndFilteredPositions = useMemo(() => {
    const { key: sortKey, dir: sortDir } = sort;
    let list = [...portfolio.positions];
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.isin.toLowerCase().includes(q) ||
          (p.sector?.toLowerCase().includes(q) ?? false)
      );
    }
    list.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
    return list;
  }, [portfolio.positions, filterQuery, sort]);

  const hasPositions = portfolio.positions.length > 0;
  const biggestPosition = useMemo(() => {
    if (!portfolio.positions.length) return null;
    return portfolio.positions.reduce((a, b) => (a.amount >= b.amount ? a : b));
  }, [portfolio.positions]);
  const mostProfitable = useMemo(() => {
    if (!portfolio.positions.length) return null;
    return portfolio.positions.reduce((a, b) =>
      (a.variationAmount ?? 0) >= (b.variationAmount ?? 0) ? a : b
    );
  }, [portfolio.positions]);

  return {
    portfolio,
    positions: sortedAndFilteredPositions,
    hasPositions,
    parseError,
    loadFromCsv,
    clearPortfolio,
    clearParseError,
    sortKey: sort.key,
    sortDir: sort.dir,
    setSort,
    filterQuery,
    setFilterQuery,
    biggestPosition,
    mostProfitable,
  };
}
