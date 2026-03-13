import { Badge } from "@/components/ui/badge.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { Skeleton } from "@/components/ui/skeleton.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.js";
import { cn, formatEur, formatPercent } from "@/lib/utils.js";
import type { Position, PositionSortKey } from "@/types/portfolio.js";
import { AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useState } from "react";

export interface PositionsTableProps {
  positions: Position[];
  sortKey: PositionSortKey;
  sortDir: "asc" | "desc";
  onSort: (key: PositionSortKey) => void;
  filterQuery: string;
  onFilterChange: (q: string) => void;
  isLoading?: boolean;
}

const HEADERS: { key: PositionSortKey; label: string; className?: string }[] = [
  { key: "name", label: "Position" },
  { key: "quantity", label: "Quantité", className: "text-right" },
  { key: "lastPrice", label: "Prix", className: "text-right" },
  { key: "amount", label: "Montant", className: "text-right" },
  { key: "weight", label: "Poids %", className: "text-right" },
  { key: "variation", label: "Variation", className: "text-right" },
];

export function PositionsTable({
  positions,
  sortKey,
  sortDir,
  onSort,
  filterQuery,
  onFilterChange,
  isLoading = false,
}: PositionsTableProps) {
  const [focused, setFocused] = useState(false);

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Positions</CardTitle>
              <CardDescription>
                {positions.length} ligne{positions.length !== 1 ? "s" : ""} •
                Triez et filtrez
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors",
                  focused && "text-primary",
                )}
              />
              <Input
                placeholder="Rechercher (nom, ISIN…)"
                value={filterQuery}
                onChange={(e) => onFilterChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="pl-9 rounded-xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  {HEADERS.map((h) => (
                    <TableHead
                      key={h.key}
                      className={cn(
                        "cursor-pointer select-none transition-colors hover:text-foreground",
                        h.className,
                      )}
                      onClick={() => onSort(h.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {h.label}
                        {sortKey === h.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {positions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={HEADERS.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Aucune position à afficher. Importez un CSV.
                      </TableCell>
                    </TableRow>
                  ) : (
                    positions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className="truncate max-w-[350px]"
                              title={p.name}
                            >
                              {p.name}
                            </span>
                            <span
                              className="text-xs text-muted-foreground font-mono"
                              title={p.isin}
                            >
                              {p.isin}
                            </span>
                            {p.sector && (
                              <Badge
                                variant="secondary"
                                className="w-fit text-xs"
                              >
                                {p.sector}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.quantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatEur(p.lastPrice)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatEur(p.amount)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {p.weight.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "tabular-nums font-semibold",
                                  p.variation >= 0
                                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300"
                                    : "border-red-500/50 bg-red-500/15 text-red-700 dark:border-red-500/50 dark:bg-red-500/15 dark:text-red-300",
                                )}
                              >
                                {formatPercent(p.variation)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatEur(p.variationAmount)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
