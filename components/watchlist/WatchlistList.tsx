"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WatchlistItem } from "@/lib/watchlist/getWatchlistItems";

interface WatchlistListProps {
  items: WatchlistItem[];
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

export default function WatchlistList({ items }: WatchlistListProps) {
  const router = useRouter();
  const [removingTicker, setRemovingTicker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(ticker: string) {
    setRemovingTicker(ticker);
    setError(null);

    try {
      const response = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Failed to remove watchlist item");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove watchlist item"
      );
    } finally {
      setRemovingTicker(null);
    }
  }

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Watchlist
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          No watchlist items yet
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Save names you want to revisit later, then reopen them directly in the
          analyzer when you are ready to review the setup again.
        </p>

        <div className="mt-5">
          <Link
            href="/analyzer"
            className="inline-flex h-11 items-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Open analyzer
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Saved watchlist
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Reopen saved names directly in the analyzer.
          </p>
        </div>
        <p className="text-sm text-zinc-500">{items.length} saved</p>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/analyzer?ticker=${encodeURIComponent(item.ticker)}`}
                    className="text-base font-semibold text-zinc-950 transition hover:text-zinc-700"
                  >
                    {item.ticker}
                  </Link>
                  <p className="text-sm text-zinc-500">
                    Added {formatTimestamp(item.created_at)}
                  </p>
                </div>

                <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_1fr]">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Saved reason
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">
                      {item.note?.trim()
                        ? item.note
                        : "No note saved. Keep this name only if it still deserves another structured review."}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Revisit workflow
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">
                      Open this ticker in the analyzer when conditions improve, the setup becomes cleaner, or you want a fresh comparison.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/analyzer?ticker=${encodeURIComponent(item.ticker)}`}
                    className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
                  >
                    Open in analyzer →
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.ticker)}
                disabled={removingTicker === item.ticker}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {removingTicker === item.ticker
                  ? "Removing..."
                  : "Remove from watchlist"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}