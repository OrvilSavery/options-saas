"use client";

import Link from "next/link";
import { buildAnalyzerHref } from "@/lib/analyzer/reopen/buildAnalyzerHref";

type HistoryDetailClientPageProps = {
  run: any;
};

function formatCurrency(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value)
    : null;
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeStrategyType(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const value = raw.trim().toLowerCase();
  if (value === "put credit spread") return "put_credit_spread";
  if (value === "call credit spread") return "call_credit_spread";
  return value;
}

function buildRunAnalyzerHref(run: any) {
  const payload = run?.analysis_payload ?? {};
  const setup = payload?.currentComparedSetup ?? {};

  const strategyType = normalizeStrategyType(
    run?.strategy_type ?? setup?.strategy ?? run?.strategy ?? run?.strategyType
  );
  const expiration = setup?.expiration
    ? String(setup.expiration)
    : run?.expiration
    ? String(run.expiration)
    : null;
  const shortStrike =
    typeof setup?.shortStrike === "number"
      ? setup.shortStrike
      : typeof run?.shortStrike === "number"
      ? run.shortStrike
      : null;
  const longStrike =
    typeof setup?.longStrike === "number"
      ? setup.longStrike
      : typeof run?.longStrike === "number"
      ? run.longStrike
      : null;

  const hasExactReviewState = Boolean(
    strategyType && expiration && shortStrike != null && longStrike != null
  );

  return buildAnalyzerHref({
    ticker: typeof run?.ticker === "string" ? run.ticker : "",
    strategyType,
    expiration,
    shortStrike,
    longStrike,
    autorun: true,
    mode: hasExactReviewState ? "review" : "explore",
  });
}

export default function HistoryDetailClientPage({
  run,
}: HistoryDetailClientPageProps) {
  const payload = run?.analysis_payload ?? {};
  const setup = payload?.currentComparedSetup ?? {};

  const ticker =
    typeof run?.ticker === "string" ? run.ticker : "Saved analysis";
  const underlyingPrice =
    setup?.underlyingPrice ?? run?.underlyingPrice ?? run?.price ?? null;
  const savedAt = run?.created_at ?? null;
  const posture =
    typeof run?.decision === "string"
      ? run.decision
      : typeof payload?.decision === "string"
      ? payload.decision
      : null;
  const eventRisk =
    typeof run?.event_risk === "string" ? run.event_risk : null;
  const rationale =
    typeof payload?.explanation === "string"
      ? payload.explanation
      : typeof payload?.summary === "string"
      ? payload.summary
      : typeof payload?.rationale === "string"
      ? payload.rationale
      : null;

  const reopenHref = buildRunAnalyzerHref(run);
  const strategyLabel =
    typeof run?.strategy_type === "string" && run.strategy_type
      ? run.strategy_type
      : typeof setup?.setupLabel === "string"
      ? setup.setupLabel
      : null;

  const expiration = setup?.expiration
    ? String(setup.expiration)
    : run?.expiration
    ? String(run.expiration)
    : null;
  const shortStrike =
    typeof setup?.shortStrike === "number"
      ? setup.shortStrike
      : typeof run?.shortStrike === "number"
      ? run.shortStrike
      : null;
  const longStrike =
    typeof setup?.longStrike === "number"
      ? setup.longStrike
      : typeof run?.longStrike === "number"
      ? run.longStrike
      : null;
  const premium = formatCurrency(
    setup?.netCredit ?? setup?.premium ?? run?.netCredit ?? run?.premium ?? null
  );
  const maxLoss = formatCurrency(setup?.maxLoss ?? run?.maxLoss ?? null);
  const currentPrice = formatCurrency(underlyingPrice);

  const hasSetupDetails =
    expiration ||
    shortStrike != null ||
    premium != null ||
    maxLoss != null;

  const statCards = [
    posture ? { label: "Posture", value: posture } : null,
    eventRisk ? { label: "Event risk", value: eventRisk } : null,
    currentPrice ? { label: "Underlying", value: currentPrice } : null,
    savedAt ? { label: "Saved", value: formatDate(savedAt) } : null,
  ].filter((x): x is { label: string; value: string | null } => x !== null && x.value != null);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Saved analysis
        </p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              {ticker}
            </h1>
            {strategyLabel && (
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {strategyLabel}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/history"
              className="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950"
            >
              Back to history
            </Link>
            <a
              href={reopenHref}
              className="inline-flex items-center rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Reopen in analyzer
            </a>
          </div>
        </div>
      </section>

      {statCards.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                {item.value}
              </p>
            </div>
          ))}
        </section>
      )}

      {hasSetupDetails && (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            Setup details
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              expiration ? { label: "Expiration", value: expiration } : null,
              shortStrike != null && longStrike != null
                ? { label: "Strikes", value: `${shortStrike}/${longStrike}` }
                : null,
              premium ? { label: "Credit", value: premium } : null,
              maxLoss ? { label: "Max loss", value: maxLoss } : null,
            ]
              .filter((x): x is { label: string; value: string } => x !== null)
              .map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-neutral-950">
                    {item.value}
                  </p>
                </div>
              ))}
          </div>

          {rationale && (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Saved rationale
              </p>
              <p className="mt-2 text-sm leading-7 text-neutral-700">
                {rationale}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
