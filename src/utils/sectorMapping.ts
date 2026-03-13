/**
 * Map ISIN or name patterns to sector (simplified).
 * In production you would use a proper data provider (e.g. Morningstar, Bloomberg).
 */
const SECTOR_BY_ISIN_PREFIX: Record<string, string> = {
  FR: "Europe",
  IE: "Europe",
  LU: "Europe",
  DE: "Europe",
  NL: "Europe",
  US: "United States",
  XS: "International",
};

/** Known ETF / fund names -> sector (simplified). */
const SECTOR_BY_NAME: Record<string, string> = {
  "MSCI World": "Global Equity",
  "S&P 500": "US Equity",
  "Euro Stoxx": "Europe Equity",
  "Nasdaq": "US Tech",
  "Tech": "Technology",
  "EM": "Emerging Markets",
  "Emerging": "Emerging Markets",
  "Japan": "Japan",
  "Asia": "Asia",
  "Bond": "Fixed Income",
  "Obligation": "Fixed Income",
  "REIT": "Real Estate",
  "Or": "Commodities",
  "Gold": "Commodities",
  "Energy": "Energy",
  "Health": "Healthcare",
  "Pharma": "Healthcare",
};

const DEFAULT_SECTOR = "Non classé";

/**
 * Infer sector from position name and optional ISIN.
 */
export function getSectorForPosition(name: string, isin: string): string {
  const upperName = name.toUpperCase();
  for (const [keyword, sector] of Object.entries(SECTOR_BY_NAME)) {
    if (upperName.includes(keyword.toUpperCase())) return sector;
  }
  const isinPrefix = isin.slice(0, 2).toUpperCase();
  return SECTOR_BY_ISIN_PREFIX[isinPrefix] ?? DEFAULT_SECTOR;
}
