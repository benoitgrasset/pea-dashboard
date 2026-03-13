/**
 * Map ISIN / name to region for geographic allocation.
 * ISIN prefix: 2 letters = country of issuer (approx. listing/region).
 */
const REGION_BY_ISIN_PREFIX: Record<string, string> = {
  FR: "Europe",
  IE: "Europe",
  LU: "Europe",
  DE: "Europe",
  NL: "Europe",
  GB: "Europe",
  CH: "Europe",
  US: "United States",
  JP: "Japan",
  HK: "Asia",
  CN: "China",
  IN: "India",
  BR: "Latin America",
  MX: "Latin America",
  AU: "Pacific",
  KR: "Asia",
  TW: "Asia",
  XS: "International",
};

/** Name keywords -> region override. */
const REGION_BY_NAME: Record<string, string> = {
  "MSCI World": "Global",
  "S&P 500": "United States",
  "Euro Stoxx": "Europe",
  Nasdaq: "United States",
  "US Tech": "United States",
  EM: "Emerging Markets",
  Emerging: "Emerging Markets",
  Japan: "Japan",
  Asia: "Asia",
  Europe: "Europe",
  Euro: "Europe",
};

const DEFAULT_REGION = "Other";

/**
 * Map region labels to continent for consistent map coloring
 * (one color per continent).
 */
export const REGION_TO_CONTINENT: Record<string, string> = {
  Europe: "Europe",
  "United States": "Americas",
  "Latin America": "Americas",
  Japan: "Asia",
  Asia: "Asia",
  China: "Asia",
  India: "Asia",
  "Emerging Markets": "Asia",
  Pacific: "Pacific",
  Global: "Global",
  Other: "Other",
  International: "Other",
};

/** Muted color per continent for the world map (same continent = same color). */
export const CONTINENT_COLORS: Record<string, string> = {
  Europe: "hsl(210, 45%, 48%)",
  Americas: "hsl(145, 38%, 42%)",
  Asia: "hsl(35, 52%, 46%)",
  Pacific: "hsl(175, 42%, 42%)",
  Global: "hsl(0, 0%, 55%)",
  Other: "hsl(0, 0%, 50%)",
};

/**
 * Approximate [longitude, latitude] centroids for map display.
 * Used by PortfolioWorldMap to place region markers.
 */
export const REGION_CENTROIDS: Record<string, [number, number]> = {
  Europe: [10, 50],
  "United States": [-95, 38],
  Japan: [138, 36],
  Asia: [100, 34],
  China: [105, 35],
  India: [77, 21],
  "Latin America": [-60, -15],
  Pacific: [150, -25],
  "Emerging Markets": [80, 20],
  Global: [20, 30],
  Other: [0, 20],
  International: [20, 30],
};

/**
 * Infer region from position name and ISIN.
 */
export function getRegionForPosition(name: string, isin: string): string {
  const upperName = name.toUpperCase();
  for (const [keyword, region] of Object.entries(REGION_BY_NAME)) {
    if (upperName.includes(keyword.toUpperCase())) return region;
  }
  const isinPrefix = isin.slice(0, 2).toUpperCase();
  return REGION_BY_ISIN_PREFIX[isinPrefix] ?? DEFAULT_REGION;
}
