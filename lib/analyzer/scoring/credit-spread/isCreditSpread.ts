import type { AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";

export function isCreditSpread(candidate: AnalyzerStrategyCandidate | null | undefined): boolean {
  if (!candidate) return false;

  if (candidate.strategyType === "put_credit_spread" || candidate.strategyType === "call_credit_spread") {
    return true;
  }

  const lower = candidate.strategy.toLowerCase();
  return lower.includes("put credit spread") || lower.includes("call credit spread");
}
