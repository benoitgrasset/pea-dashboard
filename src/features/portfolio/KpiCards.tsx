import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Award, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Skeleton } from "@/components/ui/skeleton.js";
import { formatEur, formatPercent } from "@/lib/utils.js";
import { cn } from "@/lib/utils.js";

export interface KpiCardsProps {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  biggestPositionName?: string | null;
  biggestPositionValue?: number | null;
  mostProfitableName?: string | null;
  mostProfitableValue?: number | null;
  isLoading?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function KpiCards({
  totalValue,
  totalGainLoss,
  totalGainLossPercent,
  biggestPositionName,
  biggestPositionValue,
  mostProfitableName,
  mostProfitableValue,
  isLoading = false,
}: KpiCardsProps) {
  if (isLoading) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="overflow-hidden rounded-2xl">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28" />
            </CardContent>
          </Card>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-2xl border-border/50 transition-shadow hover:shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur totale
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatEur(totalValue)}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-2xl border-border/50 transition-shadow hover:shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gain / Perte (€)
            </CardTitle>
            {totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                totalGainLoss >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {formatEur(totalGainLoss)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-2xl border-border/50 transition-shadow hover:shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gain / Perte (%)
            </CardTitle>
            {totalGainLossPercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                totalGainLossPercent >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {formatPercent(totalGainLossPercent)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-2xl border-border/50 transition-shadow hover:shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plus grosse position
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="truncate text-lg font-semibold" title={biggestPositionName ?? undefined}>
              {biggestPositionName ?? "—"}
            </p>
            {biggestPositionValue != null && (
              <p className="text-sm text-muted-foreground tabular-nums">
                {formatEur(biggestPositionValue)}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden rounded-2xl border-border/50 transition-shadow hover:shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plus rentable
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="truncate text-lg font-semibold" title={mostProfitableName ?? undefined}>
              {mostProfitableName ?? "—"}
            </p>
            {mostProfitableValue != null && (
              <p
                className={cn(
                  "text-sm tabular-nums",
                  mostProfitableValue >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {formatEur(mostProfitableValue)}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
