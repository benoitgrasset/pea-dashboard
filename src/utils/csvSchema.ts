import { z } from "zod";

/**
 * Normalise une chaîne numérique FR (virgule décimale, espaces milliers) en format parsable.
 * Ex. "1 016,28" → "1016.28", "3,00" → "3.00"
 */
export function normalizeNumberString(s: string): string {
  return String(s)
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");
}

function parseNum(s: string): number {
  const n = Number.parseFloat(normalizeNumberString(s));
  return Number.isNaN(n) ? 0 : n;
}

/** Schema for one CSV row (semicolon-separated). Accepte virgule décimale et espaces. */
const csvRowSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  isin: z.string().min(1, "ISIN requis"),
  quantity: z.string().refine((s) => !Number.isNaN(parseNum(s)) && parseNum(s) >= 0, "Quantité invalide"),
  buyingPrice: z.string().refine((s) => !Number.isNaN(parseNum(s)) && parseNum(s) >= 0, "Prix d'achat invalide"),
  lastPrice: z.string().refine((s) => !Number.isNaN(parseNum(s)) && parseNum(s) >= 0, "Dernier prix invalide"),
  amount: z.string().refine((s) => !Number.isNaN(parseNum(s)), "Montant invalide"),
  variation: z.string().refine((s) => !Number.isNaN(parseNum(s)), "Variation invalide"),
  amountVariation: z.string().optional(),
  lastMovementDate: z.string().optional(),
});

export type CsvRowSchema = z.infer<typeof csvRowSchema>;

const ROW_KEYS = [
  "name",
  "isin",
  "quantity",
  "buyingPrice",
  "lastPrice",
  "amount",
  "variation",
  "amountVariation",
  "lastMovementDate",
] as const;

/** Parse a single row. Colonnes optionnelles : amountVariation, lastMovementDate. */
export function parseCsvRow(row: Record<string, string>): z.SafeParseReturnType<CsvRowSchema, CsvRowSchema> {
  const normalized: Record<string, string> = {};
  for (const k of ROW_KEYS) {
    const v = row[k] ?? row[k.trim()] ?? "";
    normalized[k] = typeof v === "string" ? v.trim() : String(v).trim();
  }
  return csvRowSchema.safeParse(normalized);
}

export { csvRowSchema };
