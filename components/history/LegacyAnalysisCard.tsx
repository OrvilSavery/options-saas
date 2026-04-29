"use client";

import { buildAnalyzerHref } from "@/lib/analyzer/reopen/buildAnalyzerHref";

type LegacyAnalysisRecord = {
  id: string;
  ticker: string;
  price: number | null;
  decision: string | null;
  eventRisk: string | null;
  savedAt: string | null;
  analysis?: Record<string, unknown> | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatPrice(value: number | null) {
  return value == null || !Number.isFinite(value) ? "" : `$${value.toFixed(2)}`;
}

function formatSavedDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function normalizeStrategyType(raw: unknown): string | null {
  const value = asString(raw);
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === "put credit spread") return "put_credit_spread";
  if (lower === "call credit spread") return "call_credit_spread";
  return value;
}

function currentSetup(analysis: Record<string, unknown>) {
  const direct = asRecord(analysis.currentComparedSetup);
  if (direct) return direct;
  const compared = Array.isArray(analysis.comparedSetups) ? analysis.comparedSetups : [];
  return asRecord(compared[0]);
}

function buildReviewHref(item: LegacyAnalysisRecord) {
  const ticker = (item.ticker ?? "").toUpperCase();
  const analysis = item.analysis ?? {};
  const setup = currentSetup(analysis);
  const strategyType = normalizeStrategyType(setup?.strategy ?? analysis.strategy ?? analysis.strategyType);
  const expiration = asString(setup?.expiration) ?? asString(analysis.expiration);
  const shortStrike = asNumber(setup?.shortStrike) ?? asNumber(analysis.shortStrike);
  const longStrike = asNumber(setup?.longStrike) ?? asNumber(analysis.longStrike);

  return buildAnalyzerHref({
    ticker,
    strategyType,
    expiration,
    shortStrike,
    longStrike,
    autorun: true,
    mode: strategyType && expiration && shortStrike != null && longStrike != null ? "review" : "explore",
  });
}

function buildAnalyzeHref(ticker: string) {
  return buildAnalyzerHref({
    ticker,
    strategyType: null,
    expiration: null,
    shortStrike: null,
    longStrike: null,
    autorun: true,
    mode: "explore",
  });
}

function setupSummary(item: LegacyAnalysisRecord) {
  const analysis = item.analysis ?? {};
  const setup = currentSetup(analysis);
  const strategy = asString(setup?.strategy) ?? asString(analysis.strategy) ?? asString(analysis.strategyType) ?? "Credit spread";
  const shortStrike = asNumber(setup?.shortStrike) ?? asNumber(analysis.shortStrike);
  const longStrike = asNumber(setup?.longStrike) ?? asNumber(analysis.longStrike);
  const expiration = asString(setup?.expiration) ?? asString(analysis.expiration);
  const expiryLabel = expiration ? new Date(expiration).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
  const strikes = shortStrike != null && longStrike != null ? `${shortStrike}/${longStrike}` : null;
  return [strategy.replace(/_/g, " "), strikes, expiryLabel].filter(Boolean).join(" · ");
}

function verdictClasses(decision: string | null) {
  switch (String(decision ?? "").toLowerCase()) {
    case "valid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "watchlist":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "pass":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function verdictLabel(decision: string | null) {
  const value = String(decision ?? "").toLowerCase();
  if (value === "watchlist") return "Watch";
  if (value === "valid" || value === "pass") return value;
  return "Review";
}

export default function LegacyAnalysisCard({
  item,
  isLatest = false,
  isSelected = false,
  onToggleSelect,
  onDelete,
}: {
  item: LegacyAnalysisRecord;
  isLatest?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete?: () => void;
}) {
  const ticker = (item.ticker ?? "").toUpperCase();
  const reviewHref = buildReviewHref(item);
  const analyzeHref = buildAnalyzeHref(ticker);

  if (!isLatest) {
    return (
      <div className="grid grid-cols-[auto_54px_68px_1fr_auto_auto] items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs">
        {onToggleSelect ? <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="h-3.5 w-3.5 accent-slate-950" aria-label={`Select ${ticker} saved review`} /> : <span />}
        <span className="font-mono font-bold text-slate-950">{ticker}</span>
        <span className="font-mono text-slate-500">{formatPrice(item.price)}</span>
        <span className="truncate text-slate-500">{setupSummary(item)}</span>
        <span className="font-mono text-[11px] text-slate-300">{formatSavedDate(item.savedAt)}</span>
        <a href={reviewHref} className="font-semibold text-blue-600 hover:text-blue-700">Open →</a>
      </div>
    );
  }

  return (
    <article className="border-t border-slate-100 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {onToggleSelect ? <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="h-3.5 w-3.5 accent-slate-950" aria-label={`Select ${ticker} saved review`} /> : null}
            <span className="font-mono text-sm font-bold text-slate-950">{ticker}</span>
            <span className="font-mono text-xs text-slate-400">{formatPrice(item.price)}</span>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${verdictClasses(item.decision)}`}>{verdictLabel(item.decision)}</span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{setupSummary(item)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="mr-2 font-mono text-[11px] text-slate-300">Saved {formatSavedDate(item.savedAt)}</span>
          <a href={reviewHref} className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold !text-white text-white transition hover:bg-slate-800">Open review →</a>
          <a href={analyzeHref} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950">Re-analyze</a>
          {onDelete ? <button type="button" onClick={onDelete} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">Delete</button> : null}
        </div>
      </div>
    </article>
  );
}
