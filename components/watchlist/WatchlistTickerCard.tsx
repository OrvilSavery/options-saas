"use client";

import { useState } from "react";
import { buildAnalyzerHref } from "@/lib/analyzer/reopen/buildAnalyzerHref";

type WatchlistTickerSummary = {
  ticker: string;
  posture: string | null;
  strategy: string | null;
  expiration: string | null;
  shortStrike: number | null;
  longStrike: number | null;
  rationale: string | null;
  riskFlags: string[];
  underlyingPrice: number | null;
  refreshedAt: string | null;
  createdAt?: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function postureLabel(posture: string | null) {
  switch ((posture ?? "").toLowerCase()) {
    case "valid":
      return "Valid";
    case "watchlist":
      return "Watch";
    case "pass":
      return "Pass";
    default:
      return "Not checked";
  }
}

function postureClasses(posture: string | null) {
  switch ((posture ?? "").toLowerCase()) {
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

function leftBorderClass(posture: string | null) {
  return (posture ?? "").toLowerCase() === "valid" ? "border-l-4 border-l-emerald-500" : "";
}

function hasExactReviewState(item: WatchlistTickerSummary) {
  return Boolean(item.strategy && item.expiration && item.shortStrike != null && item.longStrike != null);
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

function buildReviewHref(item: WatchlistTickerSummary) {
  const exactReviewState = hasExactReviewState(item);
  return buildAnalyzerHref({
    ticker: item.ticker,
    strategyType: item.strategy,
    expiration: item.expiration,
    shortStrike: item.shortStrike,
    longStrike: item.longStrike,
    autorun: true,
    mode: exactReviewState ? "review" : "explore",
  });
}

function summaryLine(item: WatchlistTickerSummary) {
  const posture = (item.posture ?? "").toLowerCase();
  if (!item.refreshedAt) return "Not analyzed yet. Run your first check.";
  if (posture === "valid") {
    const spread = item.shortStrike != null && item.longStrike != null ? `${item.shortStrike}/${item.longStrike}` : "a clean setup";
    return `A usable setup was found. ${spread}${item.expiration ? ` credit spread` : ""}.`;
  }
  if (posture === "watchlist") return "Close, but worth watching before a fresh entry review.";
  return "No clean setup right now. Short-term timing pressure kept this from clearing.";
}

function quoteLine(item: WatchlistTickerSummary) {
  const firstRisk = item.riskFlags?.[0];
  return item.rationale ?? firstRisk ?? "Run a fresh check to update the setup read.";
}

export default function WatchlistTickerCard({
  item,
  onRemoved,
}: {
  item: WatchlistTickerSummary;
  onRemoved?: () => void;
}) {
  const ticker = (item.ticker ?? "").toUpperCase();
  const analyzeHref = buildAnalyzeHref(ticker);
  const reviewHref = buildReviewHref({ ...item, ticker });
  const [removeError, setRemoveError] = useState<string | null>(null);

  async function handleRemove() {
    const confirmed = window.confirm(`Remove ${ticker} from your watchlist?`);
    if (!confirmed) return;

    setRemoveError(null);
    try {
      const response = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setRemoveError(payload?.error ?? "Could not remove. Try again.");
        return;
      }
      onRemoved?.();
    } catch {
      setRemoveError("Could not remove. Try again.");
    }
  }

  return (
    <article className={["rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm", leftBorderClass(item.posture)].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <a href={analyzeHref} className="font-mono text-xl font-bold text-slate-950 hover:text-blue-600">
            {ticker}
          </a>
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${postureClasses(item.posture)}`}>
            {postureLabel(item.posture)}
          </span>
        </div>
        <p className="shrink-0 font-mono text-[11px] text-slate-300">Added {formatDate(item.createdAt)}</p>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-medium text-slate-400">Last check {item.refreshedAt ? <span className="font-mono">· {formatDate(item.refreshedAt)}</span> : null}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{summaryLine(item)}</p>
        <p className="mt-1 text-sm italic leading-6 text-slate-400">“{quoteLine(item)}”</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <a href={analyzeHref} className="inline-flex justify-center rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white text-white transition hover:bg-slate-800">
          Analyze now →
        </a>
        <div className="flex flex-wrap gap-2">
          {hasExactReviewState(item) ? (
            <a href={reviewHref} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950">
              View last review
            </a>
          ) : null}
          <button type="button" onClick={handleRemove} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
            Remove
          </button>
        </div>
      </div>
      {removeError ? (
        <p className="mt-2 text-xs text-red-600">{removeError}</p>
      ) : null}
    </article>
  );
}
