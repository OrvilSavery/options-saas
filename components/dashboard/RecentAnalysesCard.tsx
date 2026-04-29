import Link from "next/link";
import type { RecentAnalysisRun } from "@/lib/analysis-history/getRecentAnalysisRuns";

interface RecentAnalysesCardProps {
  analyses: RecentAnalysisRun[];
}

function badgeClasses(
  value: "valid" | "watchlist" | "pass" | "low" | "medium" | "high"
) {
  switch (value) {
    case "valid":
    case "low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "watchlist":
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "pass":
    case "high":
      return "border-red-200 bg-red-50 text-red-700";
  }
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

function formatDecisionLabel(value: "valid" | "watchlist" | "pass") {
  switch (value) {
    case "valid":
      return "Valid";
    case "watchlist":
      return "Watchlist";
    case "pass":
      return "Pass";
  }
}

export default function RecentAnalysesCard({
  analyses,
}: RecentAnalysesCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Recent analyses
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Reopen saved runs and continue reviewing prior setups.
          </p>
        </div>

        <Link
          href="/history"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
        >
          View all
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div className="mt-4">
          <p className="text-sm leading-6 text-zinc-500">
            No saved analyses yet. Run a ticker through the analyzer and your
            saved review history will appear here.
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
          {analyses.map((analysis) => (
            <article
              key={analysis.id}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/history/${analysis.id}`}
                      className="text-sm font-semibold text-zinc-950 transition hover:text-zinc-700"
                    >
                      {analysis.ticker}
                    </Link>
                    <p className="text-sm text-zinc-500">
                      ${Number(analysis.price).toFixed(2)}
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-medium text-zinc-800">
                    {analysis.best_strategy_label ?? "No strategy selected"}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {analysis.strategy_type ?? "No strategy type"} •{" "}
                    {formatTimestamp(analysis.created_at)}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    Decision stayed <span className="font-medium text-zinc-900">{formatDecisionLabel(analysis.decision)}</span>. Open
                    the saved run to review the setup, the ranked structure, and the
                    tradeoffs again before a fresh entry decision.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(
                      analysis.decision
                    )}`}
                  >
                    {analysis.decision}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(
                      analysis.event_risk
                    )}`}
                  >
                    event risk: {analysis.event_risk}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-zinc-200 pt-4">
                <Link
                  href={`/history/${analysis.id}`}
                  className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
                >
                  Open saved analysis →
                </Link>

                <Link
                  href={`/analyzer?ticker=${encodeURIComponent(analysis.ticker)}`}
                  className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
                >
                  Reopen ticker in analyzer →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}