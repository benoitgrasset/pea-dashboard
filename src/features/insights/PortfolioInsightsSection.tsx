import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.js";
import { Badge } from "@/components/ui/badge.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Progress } from "@/components/ui/progress.js";
import { Skeleton } from "@/components/ui/skeleton.js";
import { cn } from "@/lib/utils.js";
import type {
  InsightSeverity,
  PortfolioInsights as InsightsType,
  PortfolioInsight,
} from "@/types/insights.js";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from "lucide-react";

export interface PortfolioInsightsSectionProps {
  insights: InsightsType | null;
  isLoading?: boolean;
}

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  {
    icon: React.ComponentType<{ className?: string }>;
    variant: "default" | "destructive" | "warning" | "success";
    label: string;
  }
> = {
  info: { icon: Info, variant: "default", label: "Info" },
  warning: { icon: AlertTriangle, variant: "warning", label: "Attention" },
  error: { icon: AlertCircle, variant: "destructive", label: "Critique" },
  success: { icon: CheckCircle2, variant: "success", label: "OK" },
};

function InsightCard({ insight }: { insight: PortfolioInsight }) {
  const config = SEVERITY_CONFIG[insight.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card/80 p-4 transition-shadow hover:shadow-soft"
    >
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon
            className={cn(
              "h-4 w-4",
              insight.severity === "error" && "text-destructive",
              insight.severity === "warning" && "text-warning",
              insight.severity === "success" && "text-success",
            )}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{insight.title}</span>
            {insight.value != null && (
              <Badge variant="secondary" className="text-xs">
                {insight.value.toFixed(1)}%
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
          {insight.detail && (
            <p className="text-xs text-muted-foreground/80">{insight.detail}</p>
          )}
          {insight.recommendation && (
            <p className="text-sm text-primary/95 dark:text-primary/95 mt-1">
              {insight.recommendation}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PortfolioInsightsSection({
  insights,
  isLoading = false,
}: PortfolioInsightsSectionProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex min-h-[200px] items-center justify-center text-muted-foreground">
          Importez un CSV pour voir les analyses.
        </CardContent>
      </Card>
    );
  }

  const { score, insights: list } = insights;
  const scoreColor =
    score.score >= 70
      ? "text-success"
      : score.score >= 50
        ? "text-warning"
        : "text-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-2xl overflow-hidden border-border/50">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Portfolio Insights
          </CardTitle>
          <CardDescription>
            Analyse automatique de la diversification et des risques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score */}
          <div className="rounded-2xl bg-muted/30 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Score de diversification
                </p>
                <p
                  className={cn("text-4xl font-bold tabular-nums", scoreColor)}
                >
                  {score.score}/100
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {score.description}
                </p>
              </div>
              <div className="w-full sm:w-48">
                <Progress value={score.score} className="h-3" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {score.label}
                </p>
              </div>
            </div>
            {score.breakdown && (
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <Badge variant="secondary">
                  Concentration: {score.breakdown.concentration}
                </Badge>
                <Badge variant="secondary">
                  Secteurs: {score.breakdown.sector}
                </Badge>
                <Badge variant="secondary">
                  Géo: {score.breakdown.geography}
                </Badge>
                <Badge variant="secondary">
                  Redondance: {score.breakdown.redundancy}
                </Badge>
              </div>
            )}
          </div>

          {/* Insights list */}
          {list.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Recommandations et alertes
              </h4>
              <div className="grid gap-3 sm:grid-cols-1">
                {list.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          ) : (
            <Alert variant="success" className="rounded-2xl">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Portefeuille équilibré</AlertTitle>
              <AlertDescription>
                Aucune alerte majeure. La diversification est correcte.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
