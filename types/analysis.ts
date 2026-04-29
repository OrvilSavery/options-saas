export type EventRisk = "low" | "medium" | "high";
export type EventRiskSeverity = "info" | "warning" | "danger";
export type EventRiskSource = "mock" | "calendar" | "market" | "manual" | "unknown";

export interface EventRiskFlag {
  id: string;
  label: string;
  severity: EventRiskSeverity;
  timing?: string;
  explanation: string;
  source?: EventRiskSource;
}

export type Decision = "valid" | "watchlist" | "pass";
export type TradeQualityBand = "Strong" | "Workable" | "Selective" | "Weak";
export type ExecutionLabel = "Clean" | "Usable" | "Tight" | "Limited";
export type PremiumEnvironmentLabel =
  | "Supportive"
  | "Neutral"
  | "Less supportive";
export type VolatilityContextLabel =
  | "Supportive"
  | "Neutral"
  | "Less favorable";

export type MarketSessionState =
  | "market_open"
  | "pre_market"
  | "after_hours"
  | "market_closed"
  | "unknown";

export type QuoteStatus =
  | "live"
  | "delayed"
  | "last_available"
  | "mock"
  | "unknown";

export type DataQualityStatus = "good" | "partial" | "limited";
export type DataQualityFlagSeverity = "info" | "warning";

export interface DataQualityFlag {
  id: string;
  label: string;
  severity: DataQualityFlagSeverity;
  explanation: string;
}

export interface DataQualitySummary {
  status: DataQualityStatus;
  label: string;
  flags: DataQualityFlag[];
}

export type ReviewCoverageStatus = "checked" | "limited" | "not_included";

export interface ReviewCoverageItem {
  id: string;
  label: string;
  status: ReviewCoverageStatus;
  explanation?: string;
}

export interface ReviewScopeSummary {
  modeLabel: "Find setups" | "Review your setup";
  summary: string;
  expirationWindowLabel?: string;
  preferredWindowLabel?: string;
  screenedExpirationCount?: number | null;
}

export interface BestStrategy {
  strategy: string;
  expiration: string;
  setupLabel: string;
  premium: number | null;
  returnOnRisk: number | null;
  whyTopRanked: string;
  tradeQualityScore: number | null;
  tradeQualityBand: TradeQualityBand | null;
}

export interface SetupEvidence {
  shortStrike: number | null;
  longStrike: number | null;
  width: number | null;
  daysToExpiration: number | null;
  downsideRoom: number | null;
  setupSummary: string | null;
}

export interface ExecutionEvidence {
  bidAskWidth: number | null;
  volume: number | null;
  openInterest: number | null;
  executionLabel: ExecutionLabel | null;
  executionSummary: string | null;
}

export interface VolatilityPremiumEvidence {
  premiumEnvironmentLabel: PremiumEnvironmentLabel | null;
  volatilityContextLabel: VolatilityContextLabel | null;
  premiumToRiskPercent: number | null;
  summary: string | null;
}

export interface AnalysisEvidence {
  setupContext: SetupEvidence | null;
  executionContext: ExecutionEvidence | null;
  volatilityPremiumContext: VolatilityPremiumEvidence | null;
}

/**
 * Legacy flat evidence shape kept temporarily so older saved analyses
 * can still render safely while new analyses use grouped evidence.
 */
export interface LegacyStrategyEvidence {
  shortStrike: number | null;
  longStrike: number | null;
  width: number | null;
  daysToExpiration: number | null;
  downsideRoom: number | null;
  bidAskWidth: number | null;
  volume: number | null;
  openInterest: number | null;
  executionLabel: ExecutionLabel | null;
  executionSummary: string | null;
}

export type ComparedSetupRole = "safer" | "current" | "higher_premium";

export interface ComparedSetup {
  role: ComparedSetupRole;
  strategy: string;
  expiration: string;
  setupLabel: string;
  premium: number | null;
  returnOnRisk: number | null;
  tradeQualityScore: number | null;
  tradeQualityBand: TradeQualityBand | null;
  shortStrike: number | null;
  longStrike: number | null;
  width: number | null;
  daysToExpiration: number | null;
  downsideRoom: number | null;

  /**
   * Additive expected-move range support for compare-rail rendering.
   * These remain nullable until a deterministic analyzer-owned source
   * is wired into the ranking / compare assembly path.
   */
  expectedMoveLow: number | null;
  expectedMoveHigh: number | null;

  executionLabel: ExecutionLabel | null;
  bidAskWidth: number | null;
  volume: number | null;
  openInterest: number | null;
  note: string;
}

/**
 * Legacy name kept so existing UI imports still compile while the app
 * transitions from thin alternatives to richer compared setups.
 */
export type Alternative = ComparedSetup;

export interface AnalysisMetadata {
  analyzedAt: string;
  marketDataAsOf: string | null;
  optionsDataAsOf?: string | null;
  dataSource: "mock" | "live" | "unknown";
  dataSourceLabel?: string;
  marketSession?: MarketSessionState;
  marketSessionLabel?: string;
  quoteStatus?: QuoteStatus;
  quoteStatusLabel?: string;
  reviewScope?: ReviewScopeSummary;
  dataQuality?: DataQualitySummary;
  eventCoverage?: ReviewCoverageItem[];
  exploreContext?: {
    preferredDteMin: number;
    preferredDteMax: number;
    hardDteMin: number;
    hardDteMax: number;
    maxExpirationsChecked: number;
    screenedExpirationCount: number | null;
    noCleanSetup: boolean;
  };
}

export interface AnalysisResponse {
  ticker: string;
  price: number;
  marketCondition: string;
  volatilityCondition: string;
  eventRisk: EventRisk;
  eventRisks?: EventRiskFlag[];
  decision: Decision;
  bestStrategy: BestStrategy | null;
  evidence: AnalysisEvidence | LegacyStrategyEvidence | null;
  currentComparedSetup: ComparedSetup | null;
  comparedSetups: ComparedSetup[];
  saferAlternative: Alternative | null;
  aggressiveAlternative: Alternative | null;
  risks: string[];
  explanation: string;
  metadata?: AnalysisMetadata;
}
