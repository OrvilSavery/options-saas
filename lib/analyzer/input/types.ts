import type { Decision, EventRisk, EventRiskSeverity, EventRiskSource } from "@/types/analysis";
import type { DirectionalBias, ImpliedVolatilityLabel } from "@/lib/market-data/types";

export type AnalyzerScheduledEventType =
  | "earnings"
  | "fomc"
  | "cpi"
  | "pce"
  | "dividend"
  | "sector"
  | "macro"
  | "other";

export interface AnalyzerScheduledEvent {
  id?: string | null;
  type: AnalyzerScheduledEventType;
  label?: string | null;
  date: string;
  severity?: EventRiskSeverity | null;
  explanation?: string | null;
  source?: EventRiskSource | null;
}

export interface AnalyzerStrategyCandidate {
  strategy: string;
  expiration: string;
  setupLabel: string;

  shortStrike: number;
  longStrike: number;
  width: number;
  daysToExpiration: number;

  premium: number | null;
  netCredit: number | null;
  maxLoss: number | null;
  returnOnRisk: number | null;

  downsideBufferScore: number;
  premiumScore: number;
  simplicityScore: number;

  shortLegBidAskWidth: number | null;
  longLegBidAskWidth: number | null;
  shortLegVolume: number | null;
  longLegVolume: number | null;
  shortLegOpenInterest: number | null;
  longLegOpenInterest: number | null;

  directionalBias: DirectionalBias;
  role: "safer" | "balanced" | "aggressive";

  strategyType: "put_credit_spread" | "call_credit_spread" | "other";
  shortDelta: number | null;
  ivRank: number | null;
  ivHvRatio: number | null;
  creditPctWidth: number | null;
  maxLossRatio: number | null;
  bidAskPct: number | null;
  outsideExpectedMove: boolean | null;
  earningsInWindow: boolean | null;
  earningsDaysAfter: number | null;
  expectedMoveLow: number | null;
  expectedMoveHigh: number | null;
}

export interface AnalyzerInput {
  ticker: string;
  underlyingPrice: number;

  marketContext: {
    summary: string;
  };

  volatilityContext: {
    summary: string;
    impliedVolatilityLabel: ImpliedVolatilityLabel;
  };

  expectedMoveContext: {
    expectedMoveLow: number | null;
    expectedMoveHigh: number | null;
  };

  eventContext: {
    risk: EventRisk;
    nextEarningsDate?: string | null;
    eventSourceQuality?: string | null;
    scheduledEvents?: AnalyzerScheduledEvent[];
  };

  decisionContext: {
    decision: Decision;
    risks: string[];
  };

  candidateStrategies: AnalyzerStrategyCandidate[];
}
