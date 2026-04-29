"use client";

import { buildAnalyzerHref } from "@/lib/analyzer/reopen/buildAnalyzerHref";
import type { SavedSetupWithContinuity } from "@/lib/history/readModels";

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatPrice(value: number | null | undefined) {
  return value == null || !Number.isFinite(value) ? "" : `$${value.toFixed(2)}`;
}

function formatStructure(expiration: string | null, shortStrike: number | null, longStrike: number | null) {
  const expiry = expiration ? new Date(expiration).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
  return [shortStrike != null && longStrike != null ? `${shortStrike}/${longStrike}` : null, expiry].filter(Boolean).join(" · ");
}

function postureClasses(posture: string | null | undefined) {
  switch (posture) {
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

function postureLabel(posture: string | null | undefined) {
  if (posture === "watchlist") return "Watch";
  if (posture === "valid" || posture === "pass") return posture;
  return "Review";
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

export default function SavedSetupCard({
  item,
  isPrimary = false,
  isSelected = false,
  onToggleSelect,
  onDelete,
}: {
  item: SavedSetupWithContinuity;
  isPrimary?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete?: () => void;
}) {
  const { record, continuity } = item;
  const ticker = record.ticker.toUpperCase();
  const reviewHref = buildAnalyzerHref({
    ticker,
    strategyType: record.strategy,
    expiration: record.expiration,
    shortStrike: record.shortStrike,
    longStrike: record.longStrike,
    autorun: true,
    mode: "review",
  });
  const analyzeHref = buildAnalyzeHref(ticker);
  const summary = [record.strategy?.replace(/_/g, " ") || "Credit spread", formatStructure(record.expiration, record.shortStrike, record.longStrike)].filter(Boolean).join(" · ");

  if (!isPrimary) {
    return (
      <div className="grid grid-cols-[auto_54px_68px_1fr_auto_auto] items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs">
        {onToggleSelect ? <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="h-3.5 w-3.5 accent-slate-950" aria-label={`Select ${ticker} tracked setup`} /> : <span />}
        <span className="font-mono font-bold text-slate-950">{ticker}</span>
        <span className="font-mono text-slate-500">{formatPrice(record.snapshot?.underlyingPrice)}</span>
        <span className="truncate text-slate-500">{summary}</span>
        <span className="font-mono text-[11px] text-slate-300">{formatDate(record.savedAt)}</span>
        <a href={reviewHref} className="font-semibold text-blue-600 hover:text-blue-700">Open →</a>
      </div>
    );
  }

  return (
    <article className="border-t border-slate-100 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {onToggleSelect ? <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="h-3.5 w-3.5 accent-slate-950" aria-label={`Select ${ticker} tracked setup`} /> : null}
            <span className="font-mono text-sm font-bold text-slate-950">{ticker}</span>
            <span className="font-mono text-xs text-slate-400">{formatPrice(record.snapshot?.underlyingPrice)}</span>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${postureClasses(continuity.currentPosture)}`}>{postureLabel(continuity.currentPosture)}</span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="mr-2 font-mono text-[11px] text-slate-300">Saved {formatDate(record.savedAt)}</span>
          <a href={reviewHref} className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold !text-white text-white transition hover:bg-slate-800">Open review →</a>
          <a href={analyzeHref} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950">Re-analyze</a>
          {onDelete ? <button type="button" onClick={onDelete} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">Delete</button> : null}
        </div>
      </div>
    </article>
  );
}
