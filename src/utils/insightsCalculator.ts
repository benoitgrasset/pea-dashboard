import type { Position } from "@/types/portfolio.js";
import type { DiversificationScore, PortfolioInsight, PortfolioInsights } from "@/types/insights.js";
import { uid } from "@/lib/utils.js";

const CONCENTRATION_THRESHOLD = 25;
const SECTOR_OVERWEIGHT_THRESHOLD = 40;
const REDUNDANCY_KEYWORDS: [string[], string][] = [
  [["Nasdaq", "US Tech", "S&P 500 Tech"], "ETF tech US redondants"],
  [["MSCI World", "S&P 500", "MSCI USA"], "Exposition US potentiellement redondante"],
  [["Euro Stoxx", "Europe", "Eurozone"], "ETF Europe redondants"],
];

/**
 * Compute diversification score (0–100) and all insights.
 */
export function computePortfolioInsights(positions: Position[]): PortfolioInsights {
  const insights: PortfolioInsight[] = [];
  const totalValue = positions.reduce((s, p) => s + p.amount, 0);
  if (totalValue <= 0) {
    return {
      score: { score: 0, label: "N/A", description: "Aucune position." },
      insights: [],
      regionExposure: [],
      sectorExposure: [],
    };
  }

  const sectorWeights = new Map<string, number>();
  const regionWeights = new Map<string, number>();
  for (const p of positions) {
    const sector = p.sector ?? "Non classé";
    sectorWeights.set(sector, (sectorWeights.get(sector) ?? 0) + p.weight);
    const region = p.region ?? "Other";
    regionWeights.set(region, (regionWeights.get(region) ?? 0) + p.weight);
  }

  const sectorExposure = Array.from(sectorWeights.entries()).map(([sector, weight]) => ({ sector, weight }));
  const regionExposure = Array.from(regionWeights.entries()).map(([region, weight]) => ({ region, weight }));

  // Concentration > 25%
  for (const p of positions) {
    if (p.weight >= CONCENTRATION_THRESHOLD) {
      insights.push({
        id: uid(),
        type: "concentration",
        severity: p.weight >= 40 ? "error" : "warning",
        title: "Concentration élevée",
        description: `${p.name} représente ${p.weight.toFixed(1)}% du portefeuille.`,
        detail: `Au-dessus de ${CONCENTRATION_THRESHOLD}% par position, le risque de concentration augmente.`,
        value: p.weight,
        recommendation: "Envisagez de réduire cette position ou de diversifier.",
        relatedPositions: [p.name],
      });
    }
  }

  // Sector overweight
  for (const [sector, weight] of sectorWeights) {
    if (weight >= SECTOR_OVERWEIGHT_THRESHOLD) {
      const names = positions.filter((p) => (p.sector ?? "Non classé") === sector).map((p) => p.name);
      insights.push({
        id: uid(),
        type: "sector",
        severity: "warning",
        title: "Surpondération sectorielle",
        description: `Le secteur "${sector}" pèse ${weight.toFixed(1)}% du portefeuille.`,
        detail: `Positions: ${names.join(", ")}`,
        value: weight,
        recommendation: "Diversifiez vers d'autres secteurs pour réduire le risque.",
        relatedPositions: names,
      });
    }
  }

  // Redundancy (simplified: same family of ETFs)
  for (const [keywords, label] of REDUNDANCY_KEYWORDS) {
    const matching = positions.filter((p) =>
      keywords.some((k) => p.name.toUpperCase().includes(k.toUpperCase()))
    );
    if (matching.length >= 2) {
      insights.push({
        id: uid(),
        type: "redundancy",
        severity: "info",
        title: "Redondance potentielle",
        description: label,
        detail: matching.map((p) => p.name).join(", "),
        recommendation: "Vérifiez les chevauchements (secteurs, zones) pour éviter une sur-exposition.",
        relatedPositions: matching.map((p) => p.name),
      });
    }
  }

  // Geography: US / Europe / Emerging summary
  const usWeight =
    (regionWeights.get("United States") ?? 0) + (regionWeights.get("US Equity") ?? 0);

  if (usWeight >= 60) {
    insights.push({
      id: uid(),
      type: "geography",
      severity: "info",
      title: "Exposition US élevée",
      description: `Environ ${usWeight.toFixed(0)}% du portefeuille est exposé aux États-Unis.`,
      value: usWeight,
      recommendation: "Pour diversifier, envisagez Europe, Japon ou marchés émergents.",
    });
  }

  // Diversification score (0–100)
  let concentrationScore = 100;
  for (const p of positions) {
    if (p.weight >= 25) concentrationScore -= 15;
    if (p.weight >= 40) concentrationScore -= 20;
  }
  concentrationScore = Math.max(0, concentrationScore);

  const sectorCount = sectorWeights.size;
  const sectorScore = Math.min(100, sectorCount * 15);

  const regionCount = regionWeights.size;
  const geographyScore = Math.min(100, regionCount * 20);

  const redundancyPenalty = insights.filter((i) => i.type === "redundancy").length * 10;
  const redundancyScore = Math.max(0, 100 - redundancyPenalty);

  const score =
    Math.round(
      (concentrationScore * 0.4 + sectorScore * 0.3 + geographyScore * 0.2 + redundancyScore * 0.1) / 1
    ) || 0;
  const clampedScore = Math.min(100, Math.max(0, score));

  let label = "Faible";
  let description = "La diversification peut être améliorée.";
  if (clampedScore >= 70) {
    label = "Bon";
    description = "Portefeuille raisonnablement diversifié.";
  } else if (clampedScore >= 50) {
    label = "Moyen";
    description = "Quelques points d'attention (concentration, secteurs).";
  }

  const scoreResult: DiversificationScore = {
    score: clampedScore,
    label,
    description,
    breakdown: {
      concentration: concentrationScore,
      sector: sectorScore,
      geography: geographyScore,
      redundancy: redundancyScore,
    },
  };

  return {
    score: scoreResult,
    insights,
    regionExposure,
    sectorExposure,
  };
}
