import type { Decision, EventRisk } from "@/types/analysis";

export type TrendLabel = "bullish" | "neutral" | "bearish";
export type ImpliedVolatilityLabel = "low" | "moderate" | "high";
export type DirectionalBias = "bullish" | "bearish" | "neutral";
export type EventSourceQuality = "mock" | "live" | "limited" | "unknown";

export interface RawUnderlyingSnapshot {
  ticker: string;
  price: number;

  trendLabel: TrendLabel;
  structureSummary: string;

  impliedVolatilityLabel: ImpliedVolatilityLabel;
  premiumEnvironmentSummary: string;

  eventRisk: EventRisk;
  eventSummary: string;
  eventSourceQuality?: EventSourceQuality | null;

  decision: Decision;
  risks: string[];

  /**
   * Additive live-context fields for richer deterministic analyzer logic.
   * These stay nullable/optional until a provider supplies them reliably.
   */
  ivRank?: number | null;
  ivHvRatio?: number | null;
  nextEarningsDate?: string | null;
  expectedMoveLow?: number | null;
  expectedMoveHigh?: number | null;
}

export interface RawOptionsCandidate {
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

  /**
   * Additive scoring-module support fields.
   * Keep optional + nullable so older providers and saved data can still flow.
   */
  strategyType?: "put_credit_spread" | "call_credit_spread" | "other" | null;
  shortDelta?: number | null;
  creditPctWidth?: number | null;
  maxLossRatio?: number | null;
  bidAskPct?: number | null;
  outsideExpectedMove?: boolean | null;
  earningsInWindow?: boolean | null;
  earningsDaysAfter?: number | null;
  expectedMoveLow?: number | null;
  expectedMoveHigh?: number | null;
  ivRank?: number | null;
  ivHvRatio?: number | null;
}

export interface MarketDataSource {
  getUnderlyingSnapshot(ticker: string): Promise<RawUnderlyingSnapshot>;
}

export interface OptionsDataSource {
  getOptionsCandidates(
    ticker: string,
    underlyingPrice?: number
  ): Promise<RawOptionsCandidate[]>;
}
