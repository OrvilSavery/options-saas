import type { ImpliedVolatilityLabel } from "@/lib/market-data/types";

export function deriveVolatilitySummary(
  impliedVolatilityLabel: ImpliedVolatilityLabel,
  premiumEnvironmentSummary: string
): string {
  switch (impliedVolatilityLabel) {
    case "low":
      return `Premium is on the lighter side. ${premiumEnvironmentSummary}`;
    case "moderate":
      return `Premium is workable. ${premiumEnvironmentSummary}`;
    case "high":
      return `Premium is elevated. ${premiumEnvironmentSummary}`;
  }
}