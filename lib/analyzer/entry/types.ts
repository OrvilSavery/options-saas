export type AnalyzerEntryMode = "explore" | "review";

export type RequestedStrategyType =
  | "put_credit_spread"
  | "call_credit_spread";

export interface ExploreCandidatesRequest {
  mode: "explore";
  ticker: string;
}

export interface ReviewExactSetupRequest {
  mode: "review";
  ticker: string;
  strategyType: RequestedStrategyType;
  expiration: string;
  shortStrike: number;
  longStrike: number;
}

export type AnalyzerEntryRequest =
  | ExploreCandidatesRequest
  | ReviewExactSetupRequest;
