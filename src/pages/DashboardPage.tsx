import { Button } from "@/components/ui/button.js";
import {
  AllocationCharts,
  PortfolioWorldMap,
} from "@/features/analytics/index.js";
import { PortfolioInsightsSection } from "@/features/insights/index.js";
import { KpiCards, PositionsTable } from "@/features/portfolio/index.js";
import { CsvDropzone } from "@/features/upload/index.js";
import { useAnalytics } from "@/hooks/useAnalytics.js";
import { useInsights } from "@/hooks/useInsights.js";
import { usePortfolio } from "@/hooks/usePortfolio.js";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

export function DashboardPage() {
  const [parseError, setParseError] = useState<string | null>(null);
  const {
    portfolio,
    positions,
    hasPositions,
    parseError: portfolioError,
    loadFromCsv,
    clearPortfolio,
    clearParseError,
    sortKey,
    sortDir,
    setSort,
    filterQuery,
    setFilterQuery,
    biggestPosition,
    mostProfitable,
  } = usePortfolio();

  const analytics = useAnalytics(portfolio.positions, portfolio.totalValue);
  const insights = useInsights(portfolio.positions);

  const handleFileLoaded = useCallback(
    (content: string) => {
      setParseError(null);
      if (!content.trim()) return;
      loadFromCsv(content);
    },
    [loadFromCsv],
  );

  const displayError = portfolioError ?? parseError;
  const clearError = useCallback(() => {
    setParseError(null);
    clearParseError();
  }, [clearParseError]);

  return (
    <div className="space-y-10">
      {/* Upload */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CsvDropzone
          onFileLoaded={handleFileLoaded}
          error={displayError}
          onClearError={clearError}
        />
      </motion.section>

      {hasPositions && (
        <>
          <section className="flex flex-wrap items-center justify-between gap-4">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-semibold"
            >
              Tableau de bord
            </motion.h2>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={clearPortfolio}
                className="gap-2 rounded-xl text-red-500 hover:bg-red-500/15 hover:text-red-600 hover:border-red-400/50"
              >
                <Trash2 className="h-4 w-4" />
                Réinitialiser
              </Button>
            </motion.div>
          </section>

          {/* KPIs */}
          <section>
            <KpiCards
              totalValue={portfolio.totalValue}
              totalGainLoss={portfolio.totalGainLoss}
              totalGainLossPercent={portfolio.totalGainLossPercent}
              biggestPositionName={biggestPosition?.name}
              biggestPositionValue={biggestPosition?.amount}
              mostProfitableName={mostProfitable?.name}
              mostProfitableValue={mostProfitable?.variationAmount}
            />
          </section>

          {/* Charts */}
          <section>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-lg font-semibold"
            >
              Graphiques
            </motion.h3>
            <AllocationCharts
              byPosition={analytics.byPosition}
              bySector={analytics.bySector}
              byRegion={analytics.byRegion}
              performanceBars={analytics.performanceBars}
            />
          </section>

          {/* World map - geographic allocation */}
          <section>
            <PortfolioWorldMap byRegion={analytics.byRegion} />
          </section>

          {/* Insights */}
          <section>
            <PortfolioInsightsSection insights={insights} />
          </section>

          {/* Table */}
          <section>
            <PositionsTable
              positions={positions}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={setSort}
              filterQuery={filterQuery}
              onFilterChange={setFilterQuery}
            />
          </section>
        </>
      )}

      {!hasPositions && !displayError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center text-muted-foreground"
        >
          <p className="text-lg font-medium">Aucune donnée chargée</p>
          <p className="mt-1 text-sm">
            Importez un fichier CSV pour afficher le dashboard.
          </p>
        </motion.div>
      )}
    </div>
  );
}
