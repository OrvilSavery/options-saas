import type { AnalysisResponse, ComparedSetup, Decision } from "@/types/analysis";

export interface SavedSetupSnapshot {
  underlyingPrice: number | null;
  downsideRoomPct: number | null;
  rationale: string | null;
  primaryRiskFlags: string[];
}

export interface SavedSetupRecord {
  id: string;
  ticker: string;
  strategy: string;
  expiration: string | null;
  shortStrike: number | null;
  longStrike: number | null;
  netCredit: number | null;
  maxLoss: number | null;
  breakeven: number | null;
  posture: Decision;
  savedAt: string;
  snapshot: SavedSetupSnapshot;
}

export interface SetupContinuitySummary {
  setupId: string;
  priorPosture: Decision;
  currentPosture: Decision;
  postureChanged: boolean;
  priceChangePct: number | null;
  downsideRoomChangePct: number | null;
  summary: string;
}

export interface SavedSetupWithContinuity {
  record: SavedSetupRecord;
  currentAnalysis: AnalysisResponse | null;
  currentSetup: ComparedSetup | null;
  continuity: SetupContinuitySummary;
}
