import type { Decision } from "@/types/analysis";

export interface WatchlistTickerRecord {
  id: string;
  ticker: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistTickerReviewSummary {
  ticker: string;
  posture: Decision | null;
  strategy: string | null;
  expiration: string | null;
  shortStrike: number | null;
  longStrike: number | null;
  rationale: string | null;
  riskFlags: string[];
  underlyingPrice: number | null;
  refreshedAt: string;
}
