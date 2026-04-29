import type { WatchlistTickerRecord } from "@/lib/watchlist/types";

const STORAGE_KEY = "options-saas.watchlist.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRecords(): WatchlistTickerRecord[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as WatchlistTickerRecord[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((record) => typeof record?.ticker === "string");
  } catch {
    return [];
  }
}

function writeRecords(records: WatchlistTickerRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function listWatchlistTickers() {
  return readRecords().sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export function isTickerWatched(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  return readRecords().some((record) => record.ticker === normalized);
}

export function addTickerToWatchlist(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) return listWatchlistTickers();

  const current = readRecords();
  const existing = current.find((record) => record.ticker === normalized);
  const now = new Date().toISOString();

  if (existing) {
    const updated = current.map((record) =>
      record.ticker === normalized ? { ...record, updatedAt: now } : record
    );
    writeRecords(updated);
    return updated.sort((a, b) => a.ticker.localeCompare(b.ticker));
  }

  const next = [
    ...current,
    {
      id: `watch-${normalized}-${Date.now()}`,
      ticker: normalized,
      createdAt: now,
      updatedAt: now,
    },
  ];

  writeRecords(next);
  return next.sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export function removeTickerFromWatchlist(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  const next = readRecords().filter((record) => record.ticker !== normalized);
  writeRecords(next);
  return next.sort((a, b) => a.ticker.localeCompare(b.ticker));
}
