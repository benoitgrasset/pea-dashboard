import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Skeleton } from "@/components/ui/skeleton.js";
import { formatEur } from "@/lib/utils.js";
import type {
  BarDataPoint,
  GeoAllocation,
  PieDataPoint,
  SectorAllocation,
} from "@/types/analytics.js";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface AllocationChartsProps {
  byPosition: PieDataPoint[];
  bySector: SectorAllocation[];
  byRegion: GeoAllocation[];
  performanceBars: BarDataPoint[];
  isLoading?: boolean;
}

const CHART_COLORS = [
  "hsl(163, 72%, 42%)",
  "hsl(199, 89%, 48%)",
  "hsl(262, 83%, 58%)",
  "hsl(38, 92%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(330, 81%, 60%)",
  "hsl(0, 72%, 51%)",
  "hsl(180, 70%, 45%)",
];

function CustomPieTooltip({
  payload,
}: {
  payload?: Array<{
    name: string;
    value: number;
    payload?: { weight?: number };
  }>;
}) {
  if (!payload?.length) return null;
  const p = payload[0];
  const weight = p.payload?.weight;
  return (
    <div className="rounded-xl border border-border bg-card/95 px-4 py-3 shadow-soft text-sm">
      <p className="font-medium">{p.name}</p>
      <p className="text-muted-foreground">{formatEur(p.value)}</p>
      {weight != null && (
        <p className="text-xs text-muted-foreground">{weight.toFixed(1)}%</p>
      )}
    </div>
  );
}

function CustomBarTooltip({
  payload,
}: {
  payload?: Array<{ value: number; payload?: { variation?: number } }>;
}) {
  if (!payload?.length) return null;
  const v = payload[0].value;
  const variation = payload[0].payload?.variation;
  return (
    <div className="rounded-xl border border-border bg-card/95 px-4 py-3 shadow-soft text-sm">
      <p
        className={
          v >= 0 ? "text-success font-medium" : "text-destructive font-medium"
        }
      >
        {formatEur(v)}
      </p>
      {variation != null && (
        <p className="text-muted-foreground text-xs">
          {variation >= 0 ? "+" : ""}
          {variation.toFixed(2)}%
        </p>
      )}
    </div>
  );
}

export function AllocationCharts({
  byPosition,
  bySector,
  byRegion,
  performanceBars,
  isLoading = false,
}: AllocationChartsProps) {
  const sectorData = useMemo(
    () =>
      bySector.map((s) => ({
        name: s.sector,
        value: s.value,
        weight: s.weight,
        fill: s.fill,
      })),
    [bySector],
  );

  const regionData = useMemo(
    () =>
      byRegion.map((r) => ({
        name: r.region,
        value: r.value,
        weight: r.weight,
        fill: r.fill,
      })),
    [byRegion],
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasData =
    byPosition.length > 0 ||
    sectorData.length > 0 ||
    regionData.length > 0 ||
    performanceBars.length > 0;

  if (!hasData) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex min-h-[300px] items-center justify-center text-muted-foreground">
          Importez un CSV pour afficher les graphiques.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {byPosition.length > 0 && (
          <Card className="rounded-2xl overflow-hidden w-full md:col-span-2">
            <CardHeader>
              <CardTitle>Répartition par position</CardTitle>
              <CardDescription>
                Poids de chaque ligne dans le portefeuille
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={480}>
                <PieChart>
                  <Pie
                    data={byPosition}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {byPosition.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {sectorData.length > 0 && (
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle>Allocation sectorielle</CardTitle>
              <CardDescription>
                Exposition par secteur (estimée)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={125}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {sectorData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.fill ?? CHART_COLORS[i % CHART_COLORS.length]
                        }
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {regionData.length > 0 && (
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle>Allocation géographique</CardTitle>
              <CardDescription>Exposition par zone (estimée)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={125}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {regionData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.fill ?? CHART_COLORS[i % CHART_COLORS.length]
                        }
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {performanceBars.length > 0 && (
          <Card className="rounded-2xl overflow-hidden md:col-span-2">
            <CardHeader>
              <CardTitle>Performance par position (€)</CardTitle>
              <CardDescription>
                Gain ou perte en euros par ligne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={performanceBars}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) =>
                      `${v >= 0 ? "" : "-"}${Math.abs(v).toFixed(0)} €`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="value" name="Gain/Perte" radius={[0, 4, 4, 0]}>
                    {performanceBars.map(
                      (entry: BarDataPoint, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill ?? "hsl(var(--muted-foreground))"}
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
