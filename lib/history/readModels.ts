import type { AnalysisResponse, ComparedSetup } from "@/types/analysis";
import { buildSetupContinuitySummary } from "@/lib/analyzer/continuity/buildSetupContinuitySummary";
import { listSavedSetups } from "@/lib/history/store";

export type LegacyRun = {
  id: string;
  ticker: string;
  price: number | null;
  decision: string | null;
  eventRisk: string | null;
  savedAt: string | null;
  analysis?: Record<string, unknown> | null;
};

export type SavedSetupRecord = {
  id: string;
  ticker: string;
  strategy: string;
  expiration: string | null;
  shortStrike: number | null;
  longStrike: number | null;
  netCredit: number | null;
  maxLoss: number | null;
  breakeven: number | null;
  posture: "valid" | "watchlist" | "pass";
  savedAt: string;
  snapshot: {
    underlyingPrice: number | null;
    downsideRoomPct: number | null;
    rationale: string | null;
    primaryRiskFlags: string[];
  };
};

export type SavedSetupWithContinuity = {
  record: SavedSetupRecord;
  continuity: {
    summary: string;
    currentPosture: "valid" | "watchlist" | "pass";
    priorPosture: "valid" | "watchlist" | "pass";
    postureChanged: boolean;
    priceChangePct: number | null;
    downsideRoomChangePct: number | null;
  };
};

type HistoryApiPayload = {
  runs?: unknown[];
  analyses?: unknown[];
  items?: unknown[];
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function normalizeLegacyRuns(payload: unknown): LegacyRun[] {
  const source = Array.isArray(payload)
    ? payload
    : typeof payload === "object" && payload
      ? ((payload as HistoryApiPayload).runs ??
          (payload as HistoryApiPayload).analyses ??
          (payload as HistoryApiPayload).items ??
          [])
      : [];

  if (!Array.isArray(source)) return [];

  const runs: LegacyRun[] = [];

  source.forEach((item, index) => {
    const record = asRecord(item) ?? {};
    const analysis = asRecord(record.analysis ?? record.result ?? record.payload);

    const ticker =
      asString(record.ticker) ??
      asString(record.symbol) ??
      asString(analysis?.ticker) ??
      "";

    if (!ticker) return;

    const savedAt =
      asString(record.savedAt) ??
      asString(record.createdAt) ??
      asString(record.created_at) ??
      asString(record.updatedAt) ??
      asString(record.updated_at) ??
      null;

    runs.push({
      id: asString(record.id) ?? `legacy-${ticker}-${savedAt ?? index}`,
      ticker: ticker.toUpperCase(),
      price:
        asNumber(record.price) ??
        asNumber(record.underlyingPrice) ??
        asNumber(analysis?.price) ??
        null,
      decision:
        asString(record.decision) ??
        asString(record.posture) ??
        asString(analysis?.decision) ??
        null,
      eventRisk:
        asString(record.eventRisk) ??
        asString(analysis?.eventRisk) ??
        null,
      savedAt,
      analysis,
    });
  });

  return runs.sort((a, b) => (b.savedAt ?? "").localeCompare(a.savedAt ?? ""));
}

function normalizeAnalysisPayload(payload: unknown): AnalysisResponse | null {
  if (!payload || typeof payload !== "object") return null;

  const wrapped = payload as { analysis?: AnalysisResponse };
  if (wrapped.analysis) return wrapped.analysis;

  const direct = payload as AnalysisResponse;
  return typeof direct?.ticker === "string" ? direct : null;
}

function buildCurrentSetup(analysis: AnalysisResponse | null): ComparedSetup | null {
  if (!analysis) return null;
  return analysis.currentComparedSetup ?? analysis.comparedSetups?.[0] ?? null;
}

export async function loadLegacyHistoryRuns(): Promise<LegacyRun[]> {
  try {
    const response = await fetch("/api/history", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as unknown;
    return normalizeLegacyRuns(payload);
  } catch {
    return [];
  }
}

async function fetchAnalysisForSavedSetup(
  record: SavedSetupRecord
): Promise<AnalysisResponse | null> {
  try {
    const body = {
      ticker: record.ticker,
      mode: "review",
      strategy: record.strategy,
      strategyType: record.strategy,
      expiration: record.expiration,
      shortStrike: record.shortStrike,
      longStrike: record.longStrike,
    };

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as unknown;
    return normalizeAnalysisPayload(payload);
  } catch {
    return null;
  }
}

export async function loadSavedSetupsWithContinuity(): Promise<
  SavedSetupWithContinuity[]
> {
  const records = listSavedSetups() as SavedSetupRecord[];

  const items = await Promise.all(
    records.map(async (record) => {
      try {
        const currentAnalysis = await fetchAnalysisForSavedSetup(record);
        const currentSetup = buildCurrentSetup(currentAnalysis);

        return {
          record,
          continuity: buildSetupContinuitySummary({
            record,
            currentAnalysis,
            currentSetup,
          }),
        } satisfies SavedSetupWithContinuity;
      } catch {
        return {
          record,
          continuity: {
            currentPosture: record.posture,
            priorPosture: record.posture,
            postureChanged: false,
            priceChangePct: null,
            downsideRoomChangePct: null,
            summary: record.snapshot.rationale ?? "Saved for another look.",
          },
        } satisfies SavedSetupWithContinuity;
      }
    })
  );

  return items.sort((a, b) => b.record.savedAt.localeCompare(a.record.savedAt));
}
