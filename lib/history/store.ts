import type { AnalysisResponse, ComparedSetup } from "@/types/analysis";
import type { SavedSetupRecord } from "@/lib/history/types";

const STORAGE_KEY = "options-saas.saved-setups.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function inferStrategyKind(strategy: string | null | undefined) {
  const normalized = strategy?.toLowerCase() ?? "";

  if (normalized.includes("put") && normalized.includes("credit")) {
    return "put_credit_spread" as const;
  }

  if (normalized.includes("call") && normalized.includes("credit")) {
    return "call_credit_spread" as const;
  }

  return "unsupported" as const;
}

function deriveBreakeven(setup: ComparedSetup | null) {
  if (!setup) return null;

  const strategyKind = inferStrategyKind(setup.strategy);
  const shortStrike = setup.shortStrike;
  const premium = setup.premium;

  if (
    shortStrike == null ||
    premium == null ||
    !Number.isFinite(shortStrike) ||
    !Number.isFinite(premium)
  ) {
    return null;
  }

  if (strategyKind === "put_credit_spread") {
    return shortStrike - premium;
  }

  if (strategyKind === "call_credit_spread") {
    return shortStrike + premium;
  }

  return null;
}

function deriveMaxLoss(setup: ComparedSetup | null) {
  if (!setup) return null;

  const premium = setup.premium;
  const returnOnRisk = setup.returnOnRisk;

  if (
    premium == null ||
    returnOnRisk == null ||
    !Number.isFinite(premium) ||
    !Number.isFinite(returnOnRisk) ||
    returnOnRisk <= 0
  ) {
    return null;
  }

  return premium / returnOnRisk;
}

function firstSentence(text: string | null | undefined) {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^.*?[.!?](\s|$)/);
  return match ? match[0].trim() : trimmed;
}

function buildRecordKey(ticker: string, setup: ComparedSetup | null) {
  return [
    ticker,
    setup?.strategy ?? "",
    setup?.expiration ?? "",
    setup?.shortStrike ?? "",
    setup?.longStrike ?? "",
  ].join("::");
}

function readRecords(): SavedSetupRecord[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as SavedSetupRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((record) => typeof record?.ticker === "string");
  } catch {
    return [];
  }
}

function writeRecords(records: SavedSetupRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function listSavedSetups() {
  return readRecords().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveSetupRecord(record: SavedSetupRecord) {
  const current = readRecords();
  const targetKey = buildRecordKey(record.ticker, {
    role: "current",
    strategy: record.strategy,
    expiration: record.expiration ?? "",
    setupLabel: "",
    premium: record.netCredit,
    returnOnRisk: null,
    tradeQualityScore: null,
    tradeQualityBand: null,
    shortStrike: record.shortStrike,
    longStrike: record.longStrike,
    width: null,
    daysToExpiration: null,
    downsideRoom: null,
    expectedMoveLow: null,
    expectedMoveHigh: null,
    executionLabel: null,
    bidAskWidth: null,
    volume: null,
    openInterest: null,
    note: "",
  });

  const deduped = current.filter((existing) => {
    const existingKey = buildRecordKey(existing.ticker, {
      role: "current",
      strategy: existing.strategy,
      expiration: existing.expiration ?? "",
      setupLabel: "",
      premium: existing.netCredit,
      returnOnRisk: null,
      tradeQualityScore: null,
      tradeQualityBand: null,
      shortStrike: existing.shortStrike,
      longStrike: existing.longStrike,
      width: null,
      daysToExpiration: null,
      downsideRoom: null,
      expectedMoveLow: null,
      expectedMoveHigh: null,
      executionLabel: null,
      bidAskWidth: null,
      volume: null,
      openInterest: null,
      note: "",
    });

    return existingKey !== targetKey;
  });

  const next = [record, ...deduped].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  writeRecords(next);
  return next;
}

export function removeSavedSetup(id: string) {
  const next = readRecords().filter((record) => record.id !== id);
  writeRecords(next);
  return next.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function removeSavedSetups(ids: string[]) {
  const idSet = new Set(ids);
  const next = readRecords().filter((record) => !idSet.has(record.id));
  writeRecords(next);
  return next.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function removeSavedSetupsForTicker(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  const next = readRecords().filter((record) => record.ticker.toUpperCase() !== normalized);
  writeRecords(next);
  return next.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function isSavedSetup(ticker: string, setup: ComparedSetup | null) {
  if (!setup) return false;
  const targetKey = buildRecordKey(ticker, setup);

  return readRecords().some((record) => {
    const recordKey = [
      record.ticker,
      record.strategy,
      record.expiration ?? "",
      record.shortStrike ?? "",
      record.longStrike ?? "",
    ].join("::");

    return recordKey === targetKey;
  });
}

export function createSavedSetupRecord({
  analysis,
  setup,
}: {
  analysis: AnalysisResponse;
  setup: ComparedSetup;
}): SavedSetupRecord {
  return {
    id: `saved-${analysis.ticker}-${Date.now()}`,
    ticker: analysis.ticker,
    strategy: setup.strategy,
    expiration: setup.expiration,
    shortStrike: setup.shortStrike,
    longStrike: setup.longStrike,
    netCredit: setup.premium,
    maxLoss: deriveMaxLoss(setup),
    breakeven: deriveBreakeven(setup),
    posture: analysis.decision,
    savedAt: new Date().toISOString(),
    snapshot: {
      underlyingPrice: analysis.price ?? null,
      downsideRoomPct: setup.downsideRoom ?? null,
      rationale: firstSentence(analysis.explanation),
      primaryRiskFlags: analysis.risks.slice(0, 3),
    },
  };
}
