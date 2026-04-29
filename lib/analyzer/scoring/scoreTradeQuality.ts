import type { AnalyzerInput, AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";
import { getTradeQualityBand } from "@/lib/analyzer/scoring/getTradeQualityBand";
import type { TradeQualityResult } from "@/lib/analyzer/scoring/tradeQualityTypes";

function scoreDownsideRoom(candidate: AnalyzerStrategyCandidate): number {
  return Math.max(0, Math.min(35, Math.round((candidate.downsideBufferScore / 10) * 35)));
}

function scoreRiskReward(candidate: AnalyzerStrategyCandidate): number {
  const returnOnRisk = candidate.returnOnRisk ?? 0;
  const scaled = Math.min(returnOnRisk / 0.35, 1);
  return Math.max(0, Math.min(30, Math.round(scaled * 30)));
}

function scoreTimeStructure(candidate: AnalyzerStrategyCandidate): number {
  const dte = candidate.daysToExpiration;

  if (dte >= 14 && dte <= 30) {
    return 15;
  }

  if (dte >= 10 && dte <= 13) {
    return 12;
  }

  if (dte >= 7 && dte <= 9) {
    return 9;
  }

  return 0;
}

function averageWidth(
  shortWidth: number | null,
  longWidth: number | null
): number | null {
  if (shortWidth == null && longWidth == null) return null;
  if (shortWidth == null) return longWidth;
  if (longWidth == null) return shortWidth;
  return Number(((shortWidth + longWidth) / 2).toFixed(2));
}

function scoreBidAskQuality(candidate: AnalyzerStrategyCandidate): number {
  const avgWidth = averageWidth(
    candidate.shortLegBidAskWidth,
    candidate.longLegBidAskWidth
  );

  if (avgWidth == null) {
    return 1;
  }

  if (avgWidth <= 0.03) {
    return 7;
  }

  if (avgWidth <= 0.06) {
    return 6;
  }

  if (avgWidth <= 0.10) {
    return 5;
  }

  if (avgWidth <= 0.15) {
    return 4;
  }

  if (avgWidth <= 0.25) {
    return 2;
  }

  return 1;
}

function scoreOpenInterest(candidate: AnalyzerStrategyCandidate): number {
  const shortOi = candidate.shortLegOpenInterest ?? 0;
  const longOi = candidate.longLegOpenInterest ?? 0;

  if (shortOi >= 500 && longOi >= 250) {
    return 4;
  }

  if (shortOi >= 250 && longOi >= 100) {
    return 3;
  }

  if (shortOi >= 100 && longOi >= 50) {
    return 2;
  }

  if (shortOi > 0 || longOi > 0) {
    return 1;
  }

  return 0;
}

function scoreVolume(candidate: AnalyzerStrategyCandidate): number {
  const shortVolume = candidate.shortLegVolume ?? 0;
  const longVolume = candidate.longLegVolume ?? 0;

  if (shortVolume >= 200 && longVolume >= 50) {
    return 4;
  }

  if (shortVolume >= 100 && longVolume >= 25) {
    return 3;
  }

  if (shortVolume >= 25 || longVolume >= 10) {
    return 2;
  }

  if (shortVolume > 0 || longVolume > 0) {
    return 1;
  }

  return 0;
}

function scoreExecutionQuality(candidate: AnalyzerStrategyCandidate): number {
  const bidAskQuality = scoreBidAskQuality(candidate);
  const openInterestQuality = scoreOpenInterest(candidate);
  const volumeQuality = scoreVolume(candidate);

  return Math.max(
    0,
    Math.min(15, bidAskQuality + openInterestQuality + volumeQuality)
  );
}

function scoreVolatilityContext(input: AnalyzerInput): number {
  switch (input.volatilityContext.impliedVolatilityLabel) {
    case "low":
      return 3;
    case "moderate":
      return 5;
    case "high":
      return 2;
  }
}

export function scoreTradeQuality(
  input: AnalyzerInput,
  candidate: AnalyzerStrategyCandidate
): TradeQualityResult {
  const breakdown = {
    downsideRoom: scoreDownsideRoom(candidate),
    riskReward: scoreRiskReward(candidate),
    timeStructure: scoreTimeStructure(candidate),
    executionQuality: scoreExecutionQuality(candidate),
    volatilityContext: scoreVolatilityContext(input),
  };

  const totalScore =
    breakdown.downsideRoom +
    breakdown.riskReward +
    breakdown.timeStructure +
    breakdown.executionQuality +
    breakdown.volatilityContext;

  return {
    totalScore,
    band: getTradeQualityBand(totalScore),
    breakdown,
  };
}