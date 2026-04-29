import type { AnalysisResponse, ComparedSetup } from "@/types/analysis";
import type {
  SavedSetupRecord,
  SetupContinuitySummary,
} from "@/lib/history/types";

function formatPct(value: number | null) {
  if (value == null || !Number.isFinite(value)) return null;
  return `${Math.abs(value * 100).toFixed(1)}%`;
}

function firstSentence(text: string | null | undefined) {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^.*?[.!?](\s|$)/);
  return match ? match[0].trim() : trimmed;
}

export function buildSetupContinuitySummary({
  record,
  currentAnalysis,
  currentSetup,
}: {
  record: SavedSetupRecord;
  currentAnalysis: AnalysisResponse | null;
  currentSetup: ComparedSetup | null;
}): SetupContinuitySummary {
  if (!currentAnalysis) {
    return {
      setupId: record.id,
      priorPosture: record.posture,
      currentPosture: record.posture,
      postureChanged: false,
      priceChangePct: null,
      downsideRoomChangePct: null,
      summary: "Current review could not be refreshed right now.",
    };
  }

  const priorPrice = record.snapshot.underlyingPrice;
  const currentPrice = currentAnalysis.price ?? null;
  const priceChangePct =
    priorPrice != null &&
    currentPrice != null &&
    Number.isFinite(priorPrice) &&
    Number.isFinite(currentPrice) &&
    priorPrice !== 0
      ? (currentPrice - priorPrice) / priorPrice
      : null;

  const priorRoom = record.snapshot.downsideRoomPct;
  const currentRoom = currentSetup?.downsideRoom ?? null;
  const downsideRoomChangePct =
    priorRoom != null && currentRoom != null ? currentRoom - priorRoom : null;

  const postureChanged = record.posture !== currentAnalysis.decision;

  let summary: string;

  if (postureChanged) {
    summary = `Posture moved from ${record.posture} to ${currentAnalysis.decision}.`;
  } else if (downsideRoomChangePct != null && Math.abs(downsideRoomChangePct) >= 0.01) {
    summary = downsideRoomChangePct > 0
      ? `Downside room improved by ${formatPct(downsideRoomChangePct)}.`
      : `Downside room tightened by ${formatPct(downsideRoomChangePct)}.`;
  } else if (priceChangePct != null && Math.abs(priceChangePct) >= 0.01) {
    summary = `Price moved ${formatPct(priceChangePct)} since you saved this setup.`;
  } else {
    summary =
      firstSentence(currentAnalysis.explanation) ??
      "Setup posture is broadly unchanged since the last saved review.";
  }

  return {
    setupId: record.id,
    priorPosture: record.posture,
    currentPosture: currentAnalysis.decision,
    postureChanged,
    priceChangePct,
    downsideRoomChangePct,
    summary,
  };
}
