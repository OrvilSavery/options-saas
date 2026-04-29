import type { AnalyzerInput, AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";

export interface CreditSpreadEngineParams {
  ivRank: number;
  ivHvRatio: number;
  dte: number;
  shortDelta: number;
  creditPctWidth: number;
  maxLossRatio: number;
  outsideEM: boolean;
  earningsInWindow: boolean;
  earningsDaysAfter: number | null;
  bidAskPct: number;
}

export function buildEngineParams(
  input: AnalyzerInput,
  candidate: AnalyzerStrategyCandidate
): CreditSpreadEngineParams | null {
  if (
    candidate.ivRank == null ||
    candidate.ivHvRatio == null ||
    candidate.shortDelta == null ||
    candidate.creditPctWidth == null ||
    candidate.maxLossRatio == null ||
    candidate.bidAskPct == null ||
    candidate.outsideExpectedMove == null ||
    candidate.earningsInWindow == null
  ) {
    return null;
  }

  return {
    ivRank: candidate.ivRank,
    ivHvRatio: candidate.ivHvRatio,
    dte: candidate.daysToExpiration,
    shortDelta: Math.abs(candidate.shortDelta),
    creditPctWidth: candidate.creditPctWidth,
    maxLossRatio: candidate.maxLossRatio,
    outsideEM: candidate.outsideExpectedMove,
    earningsInWindow: candidate.earningsInWindow,
    earningsDaysAfter: candidate.earningsDaysAfter ?? null,
    bidAskPct: candidate.bidAskPct,
  };
}
