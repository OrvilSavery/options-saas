export type EventRisk = "low" | "medium" | "high";
export type Decision = "valid" | "watchlist" | "pass";

export interface BestStrategy {
  strategy: string;
  expiration: string;
  setupLabel: string;
  premium: number | null;
  returnOnRisk: number | null;
  whyTopRanked: string;
}

export interface Alternative {
  setupLabel: string;
  note: string;
}

export interface AnalysisResponse {
  ticker: string;
  price: number;
  marketCondition: string;
  volatilityCondition: string;
  eventRisk: EventRisk;
  decision: Decision;
  bestStrategy: BestStrategy | null;
  saferAlternative: Alternative | null;
  aggressiveAlternative: Alternative | null;
  risks: string[];
  explanation: string;
}