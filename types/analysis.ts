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
  eventRisk: "low" | "medium" | "high";
  decision: "valid" | "watchlist" | "pass";
  bestStrategy: BestStrategy | null;
  saferAlternative: Alternative | null;
  aggressiveAlternative: Alternative | null;
  risks: string[];
  explanation: string;
}
