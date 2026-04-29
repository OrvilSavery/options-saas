"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FullAnalysisRun } from "@/lib/analysis-history/getAllAnalysisRuns";
import DeleteAnalysisButton from "@/components/history/DeleteAnalysisButton";

function badgeClasses(value: "valid" | "watchlist" | "pass" | "low" | "medium" | "high") {
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

interface HistoryDetailClientPageProps {
  run: FullAnalysisRun;
}

export default function HistoryDetailClientPage({
  run,
}: HistoryDetailClientPageProps) {
  const router = useRouter();
  const payload = run.analysis_payload;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/history"
              className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              ← Back to history
            </Link>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Saved analysis
            </p>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-zinc-950">{run.ticker}</h1>
              <span className="text-sm text-zinc-500">${Number(run.price).toFixed(2)}</span>
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              Saved {formatTimestamp(run.created_at)}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
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

            <div className="flex flex-wrap gap-3">
              <Link
                href="/history"
                className="inline-flex h-11 items-center rounded-xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              >
                Back to history
              </Link>

              <DeleteAnalysisButton
                runId={run.id}
                onDeleted={() => router.push("/history")}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Top-ranked strategy
        </p>

        <div className="mt-3">
          <p className="text-xl font-semibold text-zinc-950">
            {payload.bestStrategy?.strategy ?? "No strategy selected"}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-800">
            {payload.bestStrategy?.setupLabel ?? "No saved setup label"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Expiration: {payload.bestStrategy?.expiration ?? "—"}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Premium
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-950">
              {payload.bestStrategy?.premium != null
                ? `$${payload.bestStrategy.premium.toFixed(2)}`
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Return on risk
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-950">
              {payload.bestStrategy?.returnOnRisk != null
                ? `${(payload.bestStrategy.returnOnRisk * 100).toFixed(1)}%`
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Why it ranked first
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            {payload.bestStrategy?.whyTopRanked ?? "No saved strategy rationale."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Market condition
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            {payload.marketCondition}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Volatility condition
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            {payload.volatilityCondition}
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Alternatives
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Safer alternative
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-900">
                {payload.saferAlternative?.setupLabel ?? "None"}
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {payload.saferAlternative?.note ?? "No safer alternative saved for this run."}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                More aggressive alternative
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-900">
                {payload.aggressiveAlternative?.setupLabel ?? "None"}
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {payload.aggressiveAlternative?.note ?? "No aggressive alternative saved for this run."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Main risks
          </p>

          {payload.risks.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {payload.risks.map((risk) => (
                <li key={risk} className="flex gap-2 text-sm leading-6 text-zinc-700">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No saved risks listed.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Saved explanation
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-700">{payload.explanation}</p>
      </section>
    </div>
  );
}