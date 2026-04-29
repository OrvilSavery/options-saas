import type { TrendLabel } from "@/lib/market-data/types";

export function deriveMarketSummary(
  trendLabel: TrendLabel,
  structureSummary: string
): string {
  switch (trendLabel) {
    case "bullish":
      return `Constructive to bullish. ${structureSummary}`;
    case "neutral":
      return `Neutral to mixed. ${structureSummary}`;
    case "bearish":
      return `Bearish or weakening. ${structureSummary}`;
  }
}