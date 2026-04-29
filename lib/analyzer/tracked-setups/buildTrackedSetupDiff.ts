import type { TrackedSetupDiff, TrackedSetupSnapshot } from "@/types/trackedSetup";

function compareNullableNumber(
  current: number | null,
  previous: number | null
): number | null {
  if (current == null || previous == null) return null;
  return Number((current - previous).toFixed(4));
}

function formatPctDelta(value: number | null): string | null {
  if (value == null) return null;
  return `${(value * 100).toFixed(1)}%`;
}

function formatDollarDelta(value: number | null): string | null {
  if (value == null) return null;
  const abs = Math.abs(value).toFixed(2);
  return `${value >= 0 ? "+" : "-"}$${abs}`;
}

function buildSummary(
  previous: TrackedSetupSnapshot,
  current: TrackedSetupSnapshot,
  postureChanged: boolean,
  priceDelta: number | null
): string {
  if (postureChanged) {
    return `Posture moved from ${previous.posture} to ${current.posture}.`;
  }

  if (priceDelta != null && Math.abs(priceDelta) >= 0.01) {
    return `Posture is unchanged, but price moved ${formatDollarDelta(priceDelta)} since the last review.`;
  }

  return "Posture is unchanged and the setup still looks broadly similar to the last review.";
}

function buildBullets(
  previous: TrackedSetupSnapshot,
  current: TrackedSetupSnapshot,
  priceDelta: number | null,
  downsideRoomDelta: number | null,
  premiumDelta: number | null,
  returnOnRiskDelta: number | null,
  executionChanged: boolean
): string[] {
  const bullets: string[] = [];

  if (priceDelta != null && Math.abs(priceDelta) >= 0.01) {
    bullets.push(`Underlying price changed by ${formatDollarDelta(priceDelta)}.`);
  }

  if (downsideRoomDelta != null && Math.abs(downsideRoomDelta) >= 0.002) {
    bullets.push(
      `Downside room changed by ${formatPctDelta(downsideRoomDelta)}.`
    );
  }

  if (premiumDelta != null && Math.abs(premiumDelta) >= 0.01) {
    bullets.push(`Premium changed by ${formatDollarDelta(premiumDelta)}.`);
  }

  if (returnOnRiskDelta != null && Math.abs(returnOnRiskDelta) >= 0.005) {
    bullets.push(
      `Return on risk changed by ${formatPctDelta(returnOnRiskDelta)}.`
    );
  }

  if (executionChanged) {
    bullets.push(
      `Execution changed from ${
        previous.executionLabel ?? "not available"
      } to ${current.executionLabel ?? "not available"}.`
    );
  }

  if (bullets.length === 0) {
    bullets.push("No material tracked differences were detected.");
  }

  return bullets;
}

export function buildTrackedSetupDiff(
  previous: TrackedSetupSnapshot,
  current: TrackedSetupSnapshot
): TrackedSetupDiff {
  const priceDelta = compareNullableNumber(current.price, previous.price);
  const downsideRoomDelta = compareNullableNumber(
    current.downsideRoom,
    previous.downsideRoom
  );
  const premiumDelta = compareNullableNumber(current.premium, previous.premium);
  const returnOnRiskDelta = compareNullableNumber(
    current.returnOnRisk,
    previous.returnOnRisk
  );
  const postureChanged = previous.posture !== current.posture;
  const executionChanged = previous.executionLabel !== current.executionLabel;

  return {
    trackedSetupKey: current.trackedSetupKey,
    previousTrackedAt: previous.trackedAt,
    currentTrackedAt: current.trackedAt,
    ticker: current.ticker,
    setupLabel: current.setupLabel,
    strategy: current.strategy,
    postureChanged,
    previousPosture: previous.posture,
    currentPosture: current.posture,
    priceDelta,
    downsideRoomDelta,
    premiumDelta,
    returnOnRiskDelta,
    executionChanged,
    previousExecutionLabel: previous.executionLabel,
    currentExecutionLabel: current.executionLabel,
    summary: buildSummary(previous, current, postureChanged, priceDelta),
    bulletDiffs: buildBullets(
      previous,
      current,
      priceDelta,
      downsideRoomDelta,
      premiumDelta,
      returnOnRiskDelta,
      executionChanged
    ),
  };
}
