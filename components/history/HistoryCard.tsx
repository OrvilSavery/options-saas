"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FullAnalysisRun } from "@/lib/analysis-history/getAllAnalysisRuns";
import DeleteAnalysisButton from "@/components/history/DeleteAnalysisButton";

interface HistoryCardProps {
  run: FullAnalysisRun;
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

function formatCurrency(value: number | null | undefined) {
  return value != null ? `$${value.toFixed(2)}` : "—";
}

function formatPercent(value: number | null | undefined) {
  return value != null ? `${(value * 100).toFixed(1)}%` : "—";
}

export default function HistoryCard({ run }: HistoryCardProps) {
  const router = useRouter();
  const payload = run.analysis_payload;

  const bestStrategy = payload.bestStrategy;
  const risks = Array.isArray(payload.risks) ? payload.risks.slice(0, 2) : [];

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/history/${run.id}`}
              className="text-lg font-semibold text-zinc-950 transition hover:text-zinc-700"
            >
              {run.ticker}
            </Link>
            <span className="text-sm text-zinc-500">
              ${Number(run.price).toFixed(2)}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-zinc-800">
            {run.best_strategy_label ?? "No strategy selected"}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {run.strategy_type ?? "No strategy type"} • Saved{" "}
            {formatTimestamp(run.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(
              run.decision
            )}`}
          >
            {run.decision}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(
              run.event_risk
            )}`}
          >
            event risk: {run.event_risk}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Setup label
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-zinc-900">
            {bestStrategy?.setupLabel ?? "No saved setup label"}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Expiration
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-zinc-900">
            {bestStrategy?.expiration ?? "—"}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Premium
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-zinc-900">
            {formatCurrency(bestStrategy?.premium)}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Return on risk
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-zinc-900">
            {formatPercent(bestStrategy?.returnOnRisk)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Market condition
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            {payload.marketCondition}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Volatility condition
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            {payload.volatilityCondition}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-zinc-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Saved explanation
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-700 line-clamp-3">
          {payload.explanation}
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-zinc-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Why reopen this saved review
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            Reopen this run when you want the full saved setup context, ranked
            structure, and explanation rather than starting from a blank ticker review.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Main risks
          </p>

          {risks.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {risks.map((risk) => (
                <li key={risk} className="flex gap-2 text-sm leading-6 text-zinc-700">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              No saved risks listed.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/history/${run.id}`}
            className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
          >
            Open saved analysis →
          </Link>

          <Link
            href={`/analyzer?ticker=${encodeURIComponent(run.ticker)}`}
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            Reopen ticker in analyzer →
          </Link>
        </div>

        <DeleteAnalysisButton
          runId={run.id}
          compact
          onDeleted={() => router.refresh()}
        />
      </div>
    </article>
  );
}