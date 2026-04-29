import type { AnalysisResponse, ComparedSetup } from "@/types/analysis";
import type { TrackedSetupSnapshot } from "@/types/trackedSetup";
import { buildTrackedSetupKey } from "@/lib/tracked-setups/buildTrackedSetupKey";

export function buildTrackedSetupSnapshot(
  data: AnalysisResponse,
  activeComparedSetup: ComparedSetup | null,
  trackedAt = new Date().toISOString()
): TrackedSetupSnapshot {
  const setup = activeComparedSetup ?? data.currentComparedSetup ?? null;

  return {
    trackedSetupKey: buildTrackedSetupKey(data.ticker, setup),
    trackedAt,
    ticker: data.ticker,
    setupLabel: setup?.setupLabel ?? "No setup",
    strategy: setup?.strategy ?? (data.bestStrategy?.strategy ?? "Unknown strategy"),
    expiration: setup?.expiration ?? data.bestStrategy?.expiration ?? null,
    posture: data.decision,
    price: data.price ?? null,
    shortStrike: setup?.shortStrike ?? null,
    longStrike: setup?.longStrike ?? null,
    width: setup?.width ?? null,
    premium: setup?.premium ?? data.bestStrategy?.premium ?? null,
    returnOnRisk: setup?.returnOnRisk ?? data.bestStrategy?.returnOnRisk ?? null,
    downsideRoom: setup?.downsideRoom ?? null,
    executionLabel: setup?.executionLabel ?? null,
    tradeQualityBand: setup?.tradeQualityBand ?? data.bestStrategy?.tradeQualityBand ?? null,
    riskFlags: Array.isArray(data.risks) ? data.risks.slice(0, 3) : [],
  };
}
