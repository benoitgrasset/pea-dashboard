import Papa from "papaparse";
import type { CsvRow } from "@/types/portfolio.js";
import type { Position } from "@/types/portfolio.js";
import { parseCsvRow, normalizeNumberString } from "./csvSchema.js";
import { getSectorForPosition } from "./sectorMapping.js";
import { getRegionForPosition } from "./geoMapping.js";
import { uid } from "@/lib/utils.js";

export interface ParseResult {
  success: true;
  positions: Position[];
  totalValue: number;
}

export interface ParseError {
  success: false;
  message: string;
  row?: number;
  details?: string;
}

export type ParseCsvResult = ParseResult | ParseError;

const CSV_HEADERS = [
  "name",
  "isin",
  "quantity",
  "buyingPrice",
  "lastPrice",
  "intradayVariation",
  "amount",
  "amountVariation",
  "variation",
  "lastMovementDate",
  "compensation",
];

/**
 * Parse a numeric string (FR format: virgule décimale, espaces milliers).
 */
function parseNumber(s: string): number {
  const n = Number.parseFloat(normalizeNumberString(s));
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Normalize variation string (e.g. "5,2%" or "5.2" or "-3,1%") to number.
 */
function parseVariation(s: string): number {
  const cleaned = normalizeNumberString(s).replace(/%/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Parse CSV string (semicolon or comma) and return normalized positions or error.
 */
export function parseCsv(csvString: string, delimiter = ";"): ParseCsvResult {
  if (!csvString || !csvString.trim()) {
    return { success: false, message: "Fichier vide." };
  }

  const parsed = Papa.parse<Record<string, string>>(csvString, {
    delimiter: delimiter === ";" ? ";" : ",",
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s/g, ""),
  });

  if (parsed.errors.length > 0 && parsed.errors.some((e) => e.type === "Quotes")) {
    return {
      success: false,
      message: "Erreur de format CSV.",
      details: parsed.errors.map((e) => e.message).join("; "),
    };
  }

  const rows = parsed.data;
  if (!rows.length) {
    return { success: false, message: "Aucune ligne de donnée trouvée." };
  }

  const positions: Position[] = [];
  let totalValue = 0;

  const headerMap: Record<string, string> = {
    name: "name",
    isin: "isin",
    quantity: "quantity",
    buyingprice: "buyingPrice",
    buying_price: "buyingPrice",
    lastprice: "lastPrice",
    last_price: "lastPrice",
    intradayvariation: "intradayVariation",
    amount: "amount",
    amountvariation: "amountVariation",
    variation: "variation",
    lastmovementdate: "lastMovementDate",
    compensation: "compensation",
  };

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    if (!rawRow || Object.keys(rawRow).length === 0) continue;

    const row: Record<string, string> = {};
    for (const [key, val] of Object.entries(rawRow)) {
      const normalizedKey = headerMap[key.trim().toLowerCase().replace(/\s/g, "")] ?? key;
      row[normalizedKey] = typeof val === "string" ? val : String(val ?? "");
    }

    const parsedRow = parseCsvRow(row);
    if (!parsedRow.success) {
      return {
        success: false,
        message: `Ligne ${i + 2}: ${parsedRow.error.errors.map((e) => e.message).join(", ")}`,
        row: i + 2,
      };
    }

    const r = parsedRow.data as CsvRow;
    const quantity = parseNumber(r.quantity);
    const buyingPrice = parseNumber(r.buyingPrice);
    const lastPrice = parseNumber(r.lastPrice);
    const amount = parseNumber(r.amount);
    const variation = parseVariation(r.variation);
    const variationAmount =
      r.amountVariation != null && r.amountVariation.trim() !== ""
        ? parseNumber(r.amountVariation)
        : amount - quantity * buyingPrice;

    const position: Position = {
      id: uid(),
      name: r.name.trim(),
      isin: r.isin.trim(),
      quantity,
      buyingPrice,
      lastPrice,
      amount,
      variation,
      variationAmount,
      sector: getSectorForPosition(r.name, r.isin),
      region: getRegionForPosition(r.name, r.isin),
      weight: 0, // set after totalValue
      ...(r.lastMovementDate?.trim() && { lastMovementDate: r.lastMovementDate.trim() }),
    };
    positions.push(position);
    totalValue += amount;
  }

  if (totalValue <= 0) {
    return { success: false, message: "La valeur totale du portefeuille doit être > 0." };
  }

  for (const p of positions) {
    p.weight = (p.amount / totalValue) * 100;
  }

  return {
    success: true,
    positions,
    totalValue,
  };
}

/**
 * Expected header line for user reference.
 */
export function getExpectedCsvFormat(): string {
  return CSV_HEADERS.join(";");
}
