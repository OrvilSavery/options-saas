export type AnalyzerEntryMode = "explore" | "review";

export interface AnalyzerReopenState {
  ticker: string;
  mode: AnalyzerEntryMode;
  strategyType: string | null;
  expiration: string | null;
  shortStrike: number | null;
  longStrike: number | null;
  autorun: boolean;
}
