export type TradeQualityBand = "Strong" | "Workable" | "Selective" | "Weak";

export interface TradeQualityBreakdown {
  downsideRoom: number;
  riskReward: number;
  timeStructure: number;
  executionQuality: number;
  volatilityContext: number;
}

export interface TradeQualityResult {
  totalScore: number;
  band: TradeQualityBand;
  breakdown: TradeQualityBreakdown;
}