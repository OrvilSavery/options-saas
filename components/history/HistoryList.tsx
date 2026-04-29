import Link from "next/link";
import type { FullAnalysisRun } from "@/lib/analysis-history/getAllAnalysisRuns";
import HistoryCard from "@/components/history/HistoryCard";

interface HistoryListProps {
  runs: FullAnalysisRun[];
  hasActiveFilters?: boolean;
}

export default function HistoryList({
  runs,
  hasActiveFilters = false,
}: HistoryListProps) {
  if (runs.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Saved analysis history
        </p>

        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          {hasActiveFilters ? "No matching saved analyses" : "No saved analyses yet"}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          {hasActiveFilters
            ? "Try adjusting your filters, or go back to the analyzer to save a new run."
            : "Run a ticker through the analyzer and saved results will appear here for review, comparison, and cleanup over time."}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/analyzer"
            className="inline-flex h-11 items-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Open analyzer
          </Link>

          {hasActiveFilters ? (
            <Link
              href="/history"
              className="inline-flex h-11 items-center rounded-xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
            >
              Clear filters
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {runs.map((run) => (
        <HistoryCard key={run.id} run={run} />
      ))}
    </div>
  );
}