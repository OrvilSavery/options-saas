import { ensureUserRecord } from "@/lib/auth";
import { getRecentAnalysisRuns } from "@/lib/analysis-history/getRecentAnalysisRuns";
import { getAllAnalysisRuns } from "@/lib/analysis-history/getAllAnalysisRuns";
import { getWatchlistItems } from "@/lib/watchlist/getWatchlistItems";
import { buildAnalyzerHref } from "@/lib/analyzer/reopen/buildAnalyzerHref";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";

type UnknownRecord = Record<string, unknown>;
type Decision = "valid" | "watchlist" | "pass" | "unknown";
type VerdictCounts = { valid: number; watchlist: number; pass: number };

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeDecision(value: unknown): Decision {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "valid" || normalized === "watchlist" || normalized === "pass") return normalized;
  return "unknown";
}

function formatPrice(value: unknown) {
  const number = asNumber(value);
  return number == null ? "" : `$${number.toFixed(2)}`;
}

function formatRelative(value: unknown) {
  const raw = asString(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatAddedDate(value: unknown) {
  const raw = asString(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return `Added ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function getAnalysisPayload(run: UnknownRecord) {
  return asRecord(run.analysis ?? run.result ?? run.payload) ?? {};
}

function getTicker(run: UnknownRecord) {
  const analysis = getAnalysisPayload(run);
  return (
    asString(run.ticker) ??
    asString(run.symbol) ??
    asString(analysis.ticker) ??
    "—"
  ).toUpperCase();
}

function getSavedAt(run: UnknownRecord) {
  return asString(run.savedAt) ?? asString(run.createdAt) ?? asString(run.created_at) ?? asString(run.updatedAt) ?? null;
}

function getDecision(run: UnknownRecord) {
  const analysis = getAnalysisPayload(run);
  return normalizeDecision(run.decision ?? run.posture ?? analysis.decision);
}

function getPrice(run: UnknownRecord) {
  const analysis = getAnalysisPayload(run);
  return run.price ?? run.underlyingPrice ?? analysis.price;
}

function getCurrentSetup(analysis: UnknownRecord) {
  const current = asRecord(analysis.currentComparedSetup);
  if (current) return current;
  const compared = Array.isArray(analysis.comparedSetups) ? analysis.comparedSetups : [];
  return asRecord(compared[0]) ?? null;
}

function getStrategyLabel(run: UnknownRecord) {
  const analysis = getAnalysisPayload(run);
  const setup = getCurrentSetup(analysis);
  const strategy = asString(setup?.strategy) ?? asString(analysis.strategy) ?? asString(analysis.strategyType) ?? "Credit spread";
  const shortStrike = asNumber(setup?.shortStrike) ?? asNumber(analysis.shortStrike);
  const longStrike = asNumber(setup?.longStrike) ?? asNumber(analysis.longStrike);
  const expiration = asString(setup?.expiration) ?? asString(analysis.expiration);
  const strikes = shortStrike != null && longStrike != null ? `${shortStrike}/${longStrike}` : null;
  return [strategy.replace(/_/g, " "), strikes, expiration ? new Date(expiration).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null]
    .filter(Boolean)
    .join(" · ");
}

function normalizeStrategyType(raw: unknown): string | null {
  const value = asString(raw);
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === "put credit spread") return "put_credit_spread";
  if (lower === "call credit spread") return "call_credit_spread";
  return value;
}

function buildOpenReviewHref(run: UnknownRecord) {
  const analysis = getAnalysisPayload(run);
  const setup = getCurrentSetup(analysis);
  const ticker = getTicker(run);
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

function buildAnalyzeTickerHref(ticker: string) {
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

function verdictClasses(decision: Decision) {
  switch (decision) {
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

function verdictBarColor(decision: Decision) {
  switch (decision) {
    case "valid":
      return "bg-emerald-500";
    case "watchlist":
      return "bg-amber-500";
    case "pass":
      return "bg-red-500";
    default:
      return "bg-slate-300";
  }
}

function distributionCounts(runs: UnknownRecord[]): VerdictCounts {
  const initialCounts: VerdictCounts = { valid: 0, watchlist: 0, pass: 0 };

  return runs.reduce<VerdictCounts>((acc, run) => {
    const decision = getDecision(run);
    if (decision === "valid") acc.valid += 1;
    else if (decision === "watchlist") acc.watchlist += 1;
    else if (decision === "pass") acc.pass += 1;
    return acc;
  }, initialCounts);
}

function weeklyCount(runs: UnknownRecord[]) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return runs.filter((run) => {
    const savedAt = getSavedAt(run);
    if (!savedAt) return false;
    const date = new Date(savedAt);
    return !Number.isNaN(date.getTime()) && date.getTime() >= cutoff;
  }).length;
}

function latestValidInsight(runs: UnknownRecord[]) {
  const valid = runs.find((run) => getDecision(run) === "valid");
  if (!valid) return null;
  const ticker = getTicker(valid);
  const savedAt = getSavedAt(valid);
  const date = savedAt ? new Date(savedAt) : null;
  const ageDays = date && !Number.isNaN(date.getTime()) ? Math.floor((Date.now() - date.getTime()) / 86400000) : null;
  if (ageDays == null || ageDays < 1 || ageDays > 7) return null;
  return {
    ticker,
    text: `${ticker} scored Valid ${ageDays === 1 ? "yesterday" : `${ageDays} days ago`} — worth checking if conditions still hold.`,
    href: buildAnalyzeTickerHref(ticker),
    action: `Re-analyze ${ticker} →`,
  };
}


export default async function DashboardPage() {
  const user = await ensureUserRecord();
  const recentAnalysesRaw = user ? await getRecentAnalysisRuns(user.id, 5) : [];
  const allAnalysesResult = user ? await getAllAnalysisRuns(user.id) : { runs: [], totalCount: 0 };
  const watchlistItemsRaw = user ? await getWatchlistItems(user.id) : [];

  const recentAnalyses = (Array.isArray(recentAnalysesRaw) ? recentAnalysesRaw : []).map((item) => asRecord(item) ?? {});
  const allRuns = (Array.isArray(allAnalysesResult?.runs) ? allAnalysesResult.runs : []).map((item) => asRecord(item) ?? {});
  const watchlistItems = (Array.isArray(watchlistItemsRaw) ? watchlistItemsRaw : []).map((item) => asRecord(item) ?? {});
  const totalAnalysisCount = typeof allAnalysesResult?.totalCount === "number" ? allAnalysesResult.totalCount : allRuns.length;
  const watchlistCount = watchlistItems.length;
  const counts = distributionCounts(allRuns.length ? allRuns : recentAnalyses);
  const weekCount = weeklyCount(allRuns.length ? allRuns : recentAnalyses);
  const latest = recentAnalyses[0] ?? null;
  const latestTicker = latest ? getTicker(latest) : null;
  const insight = latestValidInsight(allRuns.length ? allRuns : recentAnalyses);
  const watchlistPreview = watchlistItems.slice(0, 5);
  const uncheckedTickers = watchlistItems.slice(0, 2).map((item) => (asString(item.ticker) ?? asString(item.symbol) ?? "").toUpperCase()).filter(Boolean);

  return (
    <div className="mx-auto max-w-[740px] space-y-4 px-4 py-7 sm:px-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <DashboardGreeting />
          <p className="mt-1 text-[13px] text-slate-400">Here&apos;s where things stand.</p>
        </div>
        <a href="/analyzer" className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white text-white shadow-sm transition hover:bg-slate-800">
          New analysis →
        </a>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Analyses run</p>
              <p className="mt-2 font-mono text-[26px] font-bold leading-none text-slate-950">{totalAnalysisCount}</p>
            </div>
            <p className="font-mono text-xs font-semibold text-emerald-600">{weekCount > 0 ? `+${weekCount} this week` : "all time"}</p>
          </div>
          {totalAnalysisCount > 0 ? (
            <>
              <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
                {(["valid", "watchlist", "pass"] as const).map((key) => {
                  const count = counts[key];
                  if (!count) return null;
                  const width = Math.max(6, (count / Math.max(1, counts.valid + counts.watchlist + counts.pass)) * 100);
                  return <span key={key} className={`${verdictBarColor(key)} mr-0.5 last:mr-0`} style={{ width: `${width}%` }} />;
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
                <span><span className="text-emerald-600">●</span> <span className="font-mono font-semibold text-slate-500">{counts.valid}</span> valid</span>
                <span><span className="text-amber-600">●</span> <span className="font-mono font-semibold text-slate-500">{counts.watchlist}</span> watch</span>
                <span><span className="text-red-600">●</span> <span className="font-mono font-semibold text-slate-500">{counts.pass}</span> pass</span>
              </div>
            </>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Watchlist</p>
              <p className="mt-2 font-mono text-[26px] font-bold leading-none text-slate-950">{watchlistCount}</p>
            </div>
            <p className="font-mono text-xs font-semibold text-slate-400">tracked</p>
          </div>
          <p className="mt-3 text-xs text-slate-400">tickers tracked</p>
        </div>

        <a href={latest ? buildOpenReviewHref(latest) : "/analyzer"} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Last reviewed</p>
          {latest && latestTicker ? (
            <>
              <div className="mt-2 flex items-center gap-2">
                <p className="font-mono text-sm font-bold text-slate-950">{latestTicker}</p>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${verdictClasses(getDecision(latest))}`}>{getDecision(latest) === "watchlist" ? "Watch" : getDecision(latest)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{formatRelative(getSavedAt(latest))}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No reviews yet</p>
          )}
        </a>
      </section>

      {insight ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700">↗</div>
            <div className="min-w-0">
              <p className="text-sm leading-6 text-slate-700"><strong className="text-slate-950">{insight.ticker}</strong> {insight.text.replace(`${insight.ticker} `, "")}</p>
              <a href={insight.href} className="mt-1 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700">{insight.action}</a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Recent analyses</h2>
          <a href="/history" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all history →</a>
        </div>
        {recentAnalyses.length ? (
          <div className="divide-y divide-slate-100">
            {recentAnalyses.map((run, index) => {
              const ticker = getTicker(run);
              const decision = getDecision(run);
              return (
                <a key={asString(run.id) ?? `${ticker}-${index}`} href={buildOpenReviewHref(run)} className="relative grid grid-cols-[54px_68px_1fr_auto_auto] items-center gap-2 px-4 py-3 text-xs transition hover:bg-slate-50">
                  <span className={`absolute bottom-1 left-0 top-1 w-[3px] rounded-r ${verdictBarColor(decision)}`} />
                  <span className="font-mono font-bold text-slate-950">{ticker}</span>
                  <span className="font-mono text-slate-400">{formatPrice(getPrice(run))}</span>
                  <span className="truncate text-slate-500">{getStrategyLabel(run)}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${verdictClasses(decision)}`}>{decision === "watchlist" ? "Watch" : decision}</span>
                  <span className="font-mono text-[11px] text-slate-300">{formatRelative(getSavedAt(run))}</span>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-6 text-sm text-slate-500">No saved analyses yet. Run your first one in the Analyzer.</div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Watchlist</h2>
          <a href="/watchlist" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Manage watchlist →</a>
        </div>
        {watchlistPreview.length ? (
          <div className="divide-y divide-slate-100">
            {watchlistPreview.map((item, index) => {
              const ticker = (asString(item.ticker) ?? asString(item.symbol) ?? "").toUpperCase();
              return (
                <div key={ticker || index} className="grid grid-cols-[54px_80px_1fr_auto] items-center gap-2 px-4 py-3 text-xs">
                  <a href={buildAnalyzeTickerHref(ticker)} className="font-mono font-bold text-slate-950 hover:text-blue-600">{ticker}</a>
                  <span className="text-slate-300">{formatAddedDate(item.createdAt ?? item.created_at)}</span>
                  <span className="truncate text-slate-500">No clean setup right now</span>
                  <a href={buildAnalyzeTickerHref(ticker)} className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950">Analyze →</a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-6 text-sm text-slate-500">No watchlist tickers yet.</div>
        )}
      </section>

      {uncheckedTickers.length ? (
        <section className="flex flex-col gap-3 rounded-xl bg-slate-950 p-5 text-sm text-slate-300 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <p><span className="font-mono font-bold !text-white text-white">{uncheckedTickers.join(" and ")}</span> {uncheckedTickers.length === 1 ? "hasn’t" : "haven’t"} been checked recently. Conditions may have shifted.</p>
          <a href={buildAnalyzeTickerHref(uncheckedTickers[0])} className="inline-flex justify-center rounded-lg bg-white px-5 py-2.5 font-bold !text-slate-950 text-slate-950 transition hover:bg-slate-100">Check now →</a>
        </section>
      ) : null}
    </div>
  );
}
