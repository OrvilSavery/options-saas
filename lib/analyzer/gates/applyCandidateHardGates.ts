import type { AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";

function hasUsableDirectionalRoom(
  candidate: AnalyzerStrategyCandidate,
  underlyingPrice: number
): boolean {
  if (candidate.directionalBias === "bearish") {
    return candidate.shortStrike > underlyingPrice;
  }

  if (candidate.directionalBias === "bullish") {
    return candidate.shortStrike < underlyingPrice;
  }

  return false;
}

function hasValidCreditSpreadInputs(candidate: AnalyzerStrategyCandidate): boolean {
  if ((candidate.netCredit ?? 0) < 0.1) {
    return false;
  }

  if ((candidate.maxLoss ?? 0) <= 0) {
    return false;
  }

  if ((candidate.returnOnRisk ?? 0) <= 0) {
    return false;
  }

  return true;
}

function clearsEngineAlignedHardStops(candidate: AnalyzerStrategyCandidate): boolean {
  if (candidate.creditPctWidth != null && candidate.creditPctWidth < 15) {
    return false;
  }

  if (candidate.bidAskPct != null && candidate.bidAskPct > 15) {
    return false;
  }

  if (candidate.earningsInWindow === true) {
    return false;
  }

  return true;
}

export function applyCandidateHardGates(
  candidate: AnalyzerStrategyCandidate,
  underlyingPrice: number
): boolean {
  if (!Number.isFinite(underlyingPrice) || underlyingPrice <= 0) {
    return false;
  }

  if (candidate.width <= 0) {
    return false;
  }

  // Align with the scoring thesis instead of clipping the very DTE range
  // that the engine treats as the core sweet spot.
  if (candidate.daysToExpiration < 7 || candidate.daysToExpiration > 60) {
    return false;
  }

  if (!hasValidCreditSpreadInputs(candidate)) {
    return false;
  }

  if (!hasUsableDirectionalRoom(candidate, underlyingPrice)) {
    return false;
  }

  if (candidate.downsideBufferScore < 2) {
    return false;
  }

  if (!clearsEngineAlignedHardStops(candidate)) {
    return false;
  }

  return true;
}
