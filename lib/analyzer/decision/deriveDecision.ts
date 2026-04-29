import type { Decision } from "@/types/analysis";
import type { BestStrategy } from "@/types/analysis";
import type { AnalyzerInput } from "@/lib/analyzer/input/types";
import type { TradeQualityBand } from "@/lib/analyzer/scoring/tradeQualityTypes";
import { assessEventRisk } from "@/lib/analyzer/rules/assessEventRisk";

interface DeriveDecisionInput {
  input: AnalyzerInput;
  bestStrategy: BestStrategy | null;
  candidateCount: number;
  bestCandidateScore: number | null;
  bestCandidateBand: TradeQualityBand | null;
  isExactReview?: boolean;
}

export function deriveDecision({
  input,
  bestStrategy,
  candidateCount,
  bestCandidateScore,
  bestCandidateBand,
  isExactReview = false,
}: DeriveDecisionInput): Decision {
  if (
    candidateCount === 0 ||
    !bestStrategy ||
    bestCandidateScore == null ||
    !bestCandidateBand
  ) {
    return "pass";
  }

  const volatilityLabel = input.volatilityContext.impliedVolatilityLabel;
  const eventRisk = assessEventRisk(input);
  const hasComparisonSupport = isExactReview ? candidateCount >= 1 : candidateCount >= 2;

  if (bestCandidateScore < 65) {
    return "pass";
  }

  if (eventRisk === "high") {
    if (
      bestCandidateBand === "Strong" &&
      bestCandidateScore >= 75 &&
      hasComparisonSupport &&
      volatilityLabel !== "high"
    ) {
      return "watchlist";
    }

    return "pass";
  }

  if (
    bestCandidateBand === "Strong" &&
    hasComparisonSupport &&
    volatilityLabel !== "high" &&
    eventRisk === "low"
  ) {
    return "valid";
  }

  if (
    bestCandidateBand === "Strong" &&
    hasComparisonSupport &&
    volatilityLabel !== "high" &&
    eventRisk === "medium"
  ) {
    return "watchlist";
  }

  if (bestCandidateBand === "Strong" && candidateCount >= 1) {
    return "watchlist";
  }

  if (bestCandidateBand === "Workable" || bestCandidateBand === "Selective") {
    return "watchlist";
  }

  return "pass";
}
