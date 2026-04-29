import Link from "next/link";
import type { WatchlistItem } from "@/lib/watchlist/getWatchlistItems";

interface WatchlistPreviewCardProps {
  items: WatchlistItem[];
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

export default function WatchlistPreviewCard({
  items,
}: WatchlistPreviewCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Watchlist preview
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Keep likely revisit names close to the analyzer.
          </p>
        </div>

        <Link
          href="/watchlist"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
        >
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-4">
          <p className="text-sm leading-6 text-zinc-500">
            No saved watchlist items yet. Add a ticker from the analyzer to build
            a focused revisit list.
          </p>

          <div className="mt-4">
            <Link
              href="/analyzer"
              className="inline-flex h-10 items-center rounded-xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
            >
              Open analyzer
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/analyzer?ticker=${encodeURIComponent(item.ticker)}`}
                    className="text-sm font-semibold text-zinc-950 transition hover:text-zinc-700"
                  >
                    {item.ticker}
                  </Link>

                  <p className="text-xs text-zinc-500">
                    Added {formatTimestamp(item.created_at)}
                  </p>
                </div>

                <p className="text-sm leading-6 text-zinc-600">
                  {item.note?.trim()
                    ? item.note
                    : "Saved for another look. Reopen this ticker when the setup is worth a fresh review."}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/analyzer?ticker=${encodeURIComponent(item.ticker)}`}
                    className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
                  >
                    Open in analyzer →
                  </Link>

                  <Link
                    href="/watchlist"
                    className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
                  >
                    Open full watchlist →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}