export type TrackedSetupPosture = "valid" | "watchlist" | "pass";

export interface TrackedSetupSnapshot {
  trackedSetupKey: string;
  trackedAt: string;
  ticker: string;
  setupLabel: string;
  strategy: string;
  expiration: string | null;
  posture: TrackedSetupPosture;
  price: number | null;
  shortStrike: number | null;
  longStrike: number | null;
  width: number | null;
  premium: number | null;
  returnOnRisk: number | null;
  downsideRoom: number | null;
  executionLabel: string | null;
  tradeQualityBand: string | null;
  riskFlags: string[];
}

export interface TrackedSetupDiff {
  trackedSetupKey: string;
  previousTrackedAt: string;
  currentTrackedAt: string;
  ticker: string;
  setupLabel: string;
  strategy: string;
  postureChanged: boolean;
  previousPosture: TrackedSetupPosture;
  currentPosture: TrackedSetupPosture;
  priceDelta: number | null;
  downsideRoomDelta: number | null;
  premiumDelta: number | null;
  returnOnRiskDelta: number | null;
  executionChanged: boolean;
  previousExecutionLabel: string | null;
  currentExecutionLabel: string | null;
  summary: string;
  bulletDiffs: string[];
}
