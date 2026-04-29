"use client";

import { useEffect, useMemo, useState } from "react";
import AddTickerForm from "@/components/watchlist/AddTickerForm";
import WatchlistTickerCard from "@/components/watchlist/WatchlistTickerCard";

type WatchlistApiItem = {
  id?: string;
  ticker?: string;
  symbol?: string;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
};

type WatchlistTickerSummary = {
  ticker: string;
  posture: string | null;
  strategy: string | null;
  expiration: string | null;
  shortStrike: number | null;
  longStrike: number | null;
  rationale: string | null;
  riskFlags: string[];
  underlyingPrice: number | null;
  refreshedAt: string | null;
  createdAt?: string | null;
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeWatchlistPayload(payload: unknown): WatchlistApiItem[] {
  if (Array.isArray(payload)) return payload as WatchlistApiItem[];
  const record = asRecord(payload);
  if (!record) return [];
  return asArray<WatchlistApiItem>(record.items ?? record.summaries);
}

function getTicker(item: WatchlistApiItem) {
  return String(item.ticker ?? item.symbol ?? "").trim().toUpperCase();
}

function getCreatedAt(item: WatchlistApiItem) {
  return item.createdAt ?? item.created_at ?? item.updatedAt ?? item.updated_at ?? null;
}

export default function WatchlistPageClient() {
  const [items, setItems] = useState<WatchlistTickerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/watchlist", { cache: "no-store" });
        const json = (await response.json()) as unknown;

        if (!response.ok) {
          const message = asRecord(json)?.error ? String(asRecord(json)?.error) : "Failed to load watchlist.";
          throw new Error(message);
        }

        const apiItems = normalizeWatchlistPayload(json).filter((item) => getTicker(item));

        if (!cancelled) {
          setItems(
            apiItems.map((item) => ({
              ticker: getTicker(item),
              posture: null,
              strategy: null,
              expiration: null,
              shortStrike: null,
              longStrike: null,
              rationale: null,
              riskFlags: [],
              underlyingPrice: null,
              refreshedAt: null,
              createdAt: getCreatedAt(item),
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load watchlist.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const tickerCount = items.length;
  const hasItems = items.length > 0;

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const rank = (posture: string | null) => {
        if (posture === "valid") return 0;
        if (posture === "watchlist") return 1;
        return 2;
      };
      const postureDelta = rank(a.posture) - rank(b.posture);
      if (postureDelta !== 0) return postureDelta;
      return a.ticker.localeCompare(b.ticker);
    });
  }, [items]);

  return (
    <div className="mx-auto max-w-[740px] space-y-4 px-4 py-7 sm:px-6">
      <section className="flex items-end justify-between gap-4">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-950">Watchlist</h1>
        <p className="font-mono text-sm text-slate-400">{tickerCount} ticker{tickerCount === 1 ? "" : "s"}</p>
      </section>

      <AddTickerForm onSaved={() => setRefreshToken((value) => value + 1)} />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-500 shadow-sm">Refreshing watchlist…</div>
      ) : null}

      {!isLoading && !hasItems ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Your watchlist is empty.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Add tickers you want to keep an eye on. When you save an analysis, you can add the ticker here for easy re-checking.
          </p>
          <a href="/analyzer" className="mt-4 inline-flex rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white text-white transition hover:bg-slate-800">
            Go to Analyzer →
          </a>
        </div>
      ) : null}

      <div className="space-y-3">
        {sortedItems.map((item) => (
          <WatchlistTickerCard key={item.ticker} item={item} onRemoved={() => setRefreshToken((value) => value + 1)} />
        ))}
      </div>
    </div>
  );
}
