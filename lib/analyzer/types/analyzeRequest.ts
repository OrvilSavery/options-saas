export type AnalyzeMode = "explore" | "review";
export type RequestedStrategyType = "put_credit_spread" | "call_credit_spread";

export interface AnalyzeRequest {
  ticker: string;
  mode?: AnalyzeMode;
  strategyType?: RequestedStrategyType | null;
  expiration?: string | null;
  shortStrike?: number | null;
  longStrike?: number | null;
}
