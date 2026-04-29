import type {
  AnalysisResponse,
  ComparedSetup,
  Decision,
  EventRisk,
  EventRiskFlag,
  AnalysisEvidence,
  LegacyStrategyEvidence,
  AnalysisMetadata,
} from "@/types/analysis";

export interface TrackedSetupSnapshot {
  id: string;
  ticker: string;
  trackedAt: string;
  createdAt: string;
  updatedAt: string;

  price: number;
  decision: Decision;
  eventRisk: EventRisk;
  eventRisks: EventRiskFlag[];

  strategy: string | null;
  expiration: string | null;
  setupLabel: string | null;

  shortStrike: number | null;
  longStrike: number | null;
  width: number | null;
  daysToExpiration: number | null;
  downsideRoom: number | null;

  premium: number | null;
  returnOnRisk: number | null;

  expectedMoveLow: number | null;
  expectedMoveHigh: number | null;

  risks: string[];
  explanation: string;

  evidence: AnalysisEvidence | LegacyStrategyEvidence | null;
  metadata?: AnalysisMetadata;

  currentComparedSetup: ComparedSetup | null;
  comparedSetups: ComparedSetup[];

  source: "analyzer";
}

interface BuildTrackedSetupSnapshotArgs {
  analysis: AnalysisResponse;
  setup?: ComparedSetup | null;
}

/**
 * Builds a stable saved/watchlist snapshot from an analyzer result.
 *
 * This intentionally stores the normalized analyzer result shape, not raw
 * provider payloads. It should remain deterministic and UI-safe.
 */
export function buildTrackedSetupSnapshot(
  analysis: AnalysisResponse,
  setup?: ComparedSetup | null,
): TrackedSetupSnapshot;

export function buildTrackedSetupSnapshot(
  args: BuildTrackedSetupSnapshotArgs,
): TrackedSetupSnapshot;

export function buildTrackedSetupSnapshot(
  input: AnalysisResponse | BuildTrackedSetupSnapshotArgs,
  setupArg?: ComparedSetup | null,
): TrackedSetupSnapshot {
  const analysis = "analysis" in input ? input.analysis : input;
  const selectedSetup =
    "analysis" in input
      ? input.setup ?? analysis.currentComparedSetup
      : setupArg ?? analysis.currentComparedSetup;

  const now = new Date().toISOString();

  const strategy = selectedSetup?.strategy ?? analysis.bestStrategy?.strategy ?? null;
  const expiration = selectedSetup?.expiration ?? analysis.bestStrategy?.expiration ?? null;
  const setupLabel = selectedSetup?.setupLabel ?? analysis.bestStrategy?.setupLabel ?? null;

  return {
    id: buildTrackedSetupId(analysis.ticker, strategy, expiration, selectedSetup),
    ticker: analysis.ticker,
    trackedAt: now,
    createdAt: now,
    updatedAt: now,

    price: analysis.price,
    decision: analysis.decision,
    eventRisk: analysis.eventRisk,
    eventRisks: analysis.eventRisks ?? [],

    strategy,
    expiration,
    setupLabel,

    shortStrike: selectedSetup?.shortStrike ?? analysis.currentComparedSetup?.shortStrike ?? null,
    longStrike: selectedSetup?.longStrike ?? analysis.currentComparedSetup?.longStrike ?? null,
    width: selectedSetup?.width ?? analysis.currentComparedSetup?.width ?? null,
    daysToExpiration:
      selectedSetup?.daysToExpiration ?? analysis.currentComparedSetup?.daysToExpiration ?? null,
    downsideRoom: selectedSetup?.downsideRoom ?? analysis.currentComparedSetup?.downsideRoom ?? null,

    premium: selectedSetup?.premium ?? analysis.bestStrategy?.premium ?? null,
    returnOnRisk: selectedSetup?.returnOnRisk ?? analysis.bestStrategy?.returnOnRisk ?? null,

    expectedMoveLow: selectedSetup?.expectedMoveLow ?? analysis.currentComparedSetup?.expectedMoveLow ?? null,
    expectedMoveHigh:
      selectedSetup?.expectedMoveHigh ?? analysis.currentComparedSetup?.expectedMoveHigh ?? null,

    risks: analysis.risks ?? [],
    explanation: analysis.explanation,

    evidence: analysis.evidence ?? null,
    metadata: analysis.metadata,

    currentComparedSetup: analysis.currentComparedSetup ?? null,
    comparedSetups: analysis.comparedSetups ?? [],

    source: "analyzer",
  };
}

function buildTrackedSetupId(
  ticker: string,
  strategy: string | null,
  expiration: string | null,
  setup: ComparedSetup | null | undefined,
): string {
  const parts = [
    ticker.toUpperCase(),
    strategy ?? "unknown-strategy",
    expiration ?? "unknown-expiration",
    setup?.shortStrike ?? "unknown-short",
    setup?.longStrike ?? "unknown-long",
  ];

  return parts
    .join("-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}
