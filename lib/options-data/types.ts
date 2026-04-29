import type { DirectionalBias, RawOptionsCandidate } from "@/lib/market-data/types";

export interface RawOptionContractRow {
  symbol: string;
  optionType: "call" | "put";
  strike: number;
  expiration: string;
  bid: number | null;
  ask: number | null;
  last: number | null;
  volume: number | null;
  openInterest: number | null;
  delta: number | null;
  iv: number | null;
}

export interface OptionsCandidateSource {
  getOptionsCandidates(
    ticker: string,
    underlyingPrice: number
  ): Promise<RawOptionsCandidate[]>;

  getOptionsChainForExpiration(
    ticker: string,
    expiration: string
  ): Promise<RawOptionContractRow[]>;
}

interface SpreadGeneratedCandidateBase {
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
   * Keep optional + nullable so mock, live, and legacy candidates can flow
   * through provider adapters without exposing raw provider payloads.
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

export interface PutCreditSpreadRuleset {
  minDte: number;
  maxDte: number;
  allowedWidths: number[];
  minPercentBelowSpot: number;
  maxPercentBelowSpot: number;
  minNetCredit: number;
  maxGeneratedCandidates: number;
}

export interface CallCreditSpreadRuleset {
  minDte: number;
  maxDte: number;
  allowedWidths: number[];
  minPercentAboveSpot: number;
  maxPercentAboveSpot: number;
  minNetCredit: number;
  maxGeneratedCandidates: number;
}

export interface PutCreditSpreadGeneratedCandidate
  extends SpreadGeneratedCandidateBase {}

export interface CallCreditSpreadGeneratedCandidate
  extends SpreadGeneratedCandidateBase {}

export interface TradierExpirationResponse {
  expirations?: {
    date?: string[] | string;
  };
}

export interface TradierGreeksRow {
  delta?: number | string | null;
  mid_iv?: number | string | null;
  bid_iv?: number | string | null;
  ask_iv?: number | string | null;
}

export interface TradierOptionRow {
  symbol?: string;
  option_type?: string;
  strike?: number | string;
  expiration_date?: string;
  bid?: number | string | null;
  ask?: number | string | null;
  last?: number | string | null;
  volume?: number | string | null;
  open_interest?: number | string | null;
  greeks?: TradierGreeksRow | null;
}

export interface TradierOptionsChainResponse {
  options?: {
    option?: TradierOptionRow[] | TradierOptionRow;
  };
}
