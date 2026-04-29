import type { AnalysisResponse, ComparedSetup } from "@/types/analysis";

function setupIdentity(setup: ComparedSetup | null) {
  if (!setup) return "no-setup";

  return [
    setup.strategy,
    setup.expiration ?? "",
    setup.setupLabel,
    setup.shortStrike ?? "",
    setup.longStrike ?? "",
    setup.width ?? "",
  ].join("::");
}

export function buildTrackedSetupKey(
  ticker: string,
  activeComparedSetup: ComparedSetup | null
): string {
  return `${ticker.toUpperCase()}::${setupIdentity(activeComparedSetup)}`;
}

export function buildTrackedSetupKeyFromAnalysis(
  data: AnalysisResponse,
  activeComparedSetup: ComparedSetup | null
): string {
  return buildTrackedSetupKey(data.ticker, activeComparedSetup);
}
