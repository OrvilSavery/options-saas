import type { TradeQualityBand } from "@/lib/analyzer/scoring/tradeQualityTypes";

export function getTradeQualityBand(score: number): TradeQualityBand {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 65) {
    return "Workable";
  }

  if (score >= 50) {
    return "Selective";
  }

  return "Weak";
}