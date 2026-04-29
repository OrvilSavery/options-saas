interface HistoryFiltersProps {
  currentTicker?: string;
  currentDecision?: string;
}

export default function HistoryFilters({
  currentTicker = "",
  currentDecision = "",
}: HistoryFiltersProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Filters
      </p>

      <form method="GET" className="mt-4 grid gap-4 md:grid-cols-[1fr_220px_auto]">
        <div>
          <label
            htmlFor="ticker"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Ticker
          </label>
          <input
            id="ticker"
            name="ticker"
            type="text"
            defaultValue={currentTicker}
            placeholder="SPY, QQQ, AAPL..."
            className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="decision"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Decision
          </label>
          <select
            id="decision"
            name="decision"
            defaultValue={currentDecision}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
          >
            <option value="">All decisions</option>
            <option value="valid">Valid</option>
            <option value="watchlist">Watchlist</option>
            <option value="pass">Pass</option>
          </select>
        </div>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Apply filters
          </button>

          <a
            href="/history"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
          >
            Clear
          </a>
        </div>
      </form>
    </section>
  );
}