"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisEvidence, AnalysisResponse, ComparedSetup } from "@/types/analysis";
import RecommendedSetupHero from "@/components/analyzer/RecommendedSetupHero";
import SetupMapCard from "@/components/analyzer/SetupMapCard";
import EventMacroRiskPanel from "@/components/analyzer/EventMacroRiskPanel";
import DataTransparencyPanel from "@/components/analyzer/DataTransparencyPanel";
import CompareSetupsPreview from "@/components/analyzer/CompareSetupsPreview";
import TradeoffMatrix from "@/components/analyzer/TradeoffMatrix";
import AnalyzerDetailTabs from "@/components/analyzer/AnalyzerDetailTabs";
import PayoffDiagramCard from "@/components/analyzer/PayoffDiagramCard";
import AnalyzerToast from "@/components/analyzer/AnalyzerToast";

interface AnalyzerResultWorkspaceProps {
  data: AnalysisResponse;
  evidence: AnalysisEvidence | null;
  analysisMode: "explore" | "review";
  onReanalyze?: () => void;
}

interface DisplayRiskFlag {
  text: string;
  severity: "danger" | "warning";
}

function buildSetupKey(setup: ComparedSetup | null): string {
  if (!setup) return "";
  return [setup.role, setup.strategy, setup.expiration, setup.setupLabel, setup.shortStrike, setup.longStrike, setup.width].join("::");
}

function dedupeComparedSetups(setups: Array<ComparedSetup | null>): ComparedSetup[] {
  const seen = new Set<string>();
  const results: ComparedSetup[] = [];
  for (const setup of setups) {
    if (!setup) continue;
    const key = buildSetupKey(setup);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(setup);
  }
  return results;
}

function findLeadSetup(selectableSetups: ComparedSetup[], currentComparedSetup: ComparedSetup | null) {
  if (currentComparedSetup?.role === "current") return currentComparedSetup;
  return selectableSetups.find((setup) => setup.role === "current") ?? currentComparedSetup ?? selectableSetups[0] ?? null;
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function metricSubtitle(type: "premium" | "room" | "dte", setup: ComparedSetup | null) {
  if (!setup) return { text: "—", className: "text-slate-400", barClassName: "bg-slate-300", fill: 0 };

  if (type === "premium") {
    const pct = setup.width && setup.premium != null ? setup.premium / setup.width : null;
    if (pct != null && pct < 0.15) return { text: "thin credit", className: "text-amber-700", barClassName: "bg-amber-500", fill: 0 };
    if (pct != null && pct >= 0.2) return { text: "usable credit", className: "text-emerald-700", barClassName: "bg-emerald-500", fill: 0 };
    return { text: "net credit", className: "text-slate-400", barClassName: "bg-slate-300", fill: 0 };
  }

  if (type === "room") {
    const room = setup.downsideRoom;
    const fill = room == null ? 0 : Math.max(2, Math.min(100, (room / 0.15) * 100));
    if (room != null && room < 0.03) return { text: "tight to short strike", className: "text-red-700", barClassName: "bg-red-500", fill };
    if (room != null && room < 0.05) return { text: "watch closely", className: "text-amber-700", barClassName: "bg-amber-500", fill };
    if (room != null && room >= 0.05) return { text: "to short strike", className: "text-emerald-700", barClassName: "bg-emerald-500", fill };
    return { text: "to short strike", className: "text-slate-400", barClassName: "bg-slate-300", fill };
  }

  const dte = setup.daysToExpiration;
  const fill = dte == null ? 0 : Math.max(2, Math.min(100, (dte / 45) * 100));
  if (dte === 0) return { text: "expiration day", className: "text-red-700", barClassName: "bg-red-500", fill };
  if (dte != null && dte < 15) return { text: "short window", className: "text-amber-700", barClassName: "bg-amber-500", fill };
  if (dte != null) return { text: "theta window", className: "text-emerald-700", barClassName: "bg-emerald-500", fill };
  return { text: "days left", className: "text-slate-400", barClassName: "bg-slate-300", fill };
}

function deriveMaxLoss(setup: ComparedSetup | null) {
  if (!setup || setup.premium == null || setup.width == null) return null;
  return Math.max(0, setup.width - setup.premium);
}

function buildDisplayRisks(setup: ComparedSetup | null, fallbackRisks: string[]): DisplayRiskFlag[] {
  if (!setup) return fallbackRisks.slice(0, 2).map((text) => ({ text, severity: "warning" as const }));

  const flags: DisplayRiskFlag[] = [];

  if (setup.daysToExpiration != null && setup.daysToExpiration <= 0) {
    flags.push({
      severity: "danger",
      text: "0 DTE means this expires today — there is almost no time to manage the setup if price moves against you.",
    });
  } else if (setup.daysToExpiration != null && setup.daysToExpiration < 10) {
    flags.push({
      severity: "warning",
      text: `${Math.round(setup.daysToExpiration)} DTE leaves a short management window if price moves toward the short strike.`,
    });
  }

  if (setup.downsideRoom != null && setup.downsideRoom <= 0.04) {
    flags.push({
      severity: flags.some((flag) => flag.severity === "danger") ? "warning" : setup.downsideRoom < 0.03 ? "danger" : "warning",
      text: `Your short strike is only ${(setup.downsideRoom * 100).toFixed(1)}% from the current price — that is uncomfortably close for a credit spread. A small move puts the spread under pressure fast.`,
    });
  }

  if (flags.length < 2 && setup.width != null && setup.premium != null && setup.width > 0) {
    const creditPctWidth = setup.premium / setup.width;
    if (creditPctWidth < 0.15) {
      flags.push({
        severity: "warning",
        text: `You're collecting ${formatCurrency(setup.premium)} on a $${setup.width.toFixed(0)} spread — that's a ${(creditPctWidth * 100).toFixed(1)}% credit-to-width, which is thin for the exposure.`,
      });
    }
  }

  for (const risk of fallbackRisks) {
    if (flags.length >= 2) break;
    const normalizedRisk = risk.toLowerCase();
    const duplicate = flags.some((flag) => {
      const existing = flag.text.toLowerCase();
      return (
        (existing.includes("dte") && normalizedRisk.includes("dte")) ||
        (existing.includes("short strike") && normalizedRisk.includes("short strike")) ||
        (existing.includes("premium") && normalizedRisk.includes("premium")) ||
        (existing.includes("expiration") && normalizedRisk.includes("time window"))
      );
    });
    if (!duplicate) flags.push({ text: risk, severity: "warning" });
  }

  return flags.slice(0, 2);
}

async function saveAnalysisRunToApi(analysis: AnalysisResponse) {
  const response = await fetch("/api/analysis-runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analysis }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to save review.");
  }
}

async function saveWatchlistTickerToApi(ticker: string) {
  const response = await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to add ticker to watchlist.");
  }
}

export default function AnalyzerResultWorkspace({ data, evidence, analysisMode, onReanalyze }: AnalyzerResultWorkspaceProps) {
  const router = useRouter();
  const comparedSetups = data.comparedSetups ?? [];

  const selectableSetups = useMemo(
    () => dedupeComparedSetups([...(comparedSetups ?? []), data.currentComparedSetup, data.saferAlternative, data.aggressiveAlternative]),
    [comparedSetups, data.currentComparedSetup, data.saferAlternative, data.aggressiveAlternative]
  );

  const leadSetup = findLeadSetup(selectableSetups, data.currentComparedSetup);
  const activeComparedSetupDefault = leadSetup ?? data.currentComparedSetup ?? selectableSetups[0] ?? data.saferAlternative ?? data.aggressiveAlternative ?? null;
  const defaultActiveKey = buildSetupKey(activeComparedSetupDefault);
  const [activeSetupKey, setActiveSetupKey] = useState(defaultActiveKey);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<"history" | "watchlist" | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [showPriceContext, setShowPriceContext] = useState(false);

  useEffect(() => setActiveSetupKey(defaultActiveKey), [defaultActiveKey]);

  const activeComparedSetup = selectableSetups.find((setup) => buildSetupKey(setup) === activeSetupKey) ?? activeComparedSetupDefault;
  const watchButtonLabel = analysisMode === "review" ? "Add setup to watchlist" : "Add ticker to watchlist";

  useEffect(() => {
    setIsSaved(false);
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    async function checkWatched() {
      try {
        const response = await fetch("/api/watchlist", { cache: "no-store" });
        if (!response.ok) return;
        const json = (await response.json()) as { items?: Array<{ ticker?: string }> };
        const items = Array.isArray(json?.items) ? json.items : [];
        if (!cancelled) {
          setIsWatched(items.some((item) => (item.ticker ?? "").toUpperCase() === data.ticker.toUpperCase()));
        }
      } catch {
        // leave as false
      }
    }
    void checkWatched();
    return () => { cancelled = true; };
  }, [data.ticker]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => {
      setToastMessage(null);
      setToastAction(null);
    }, 3600);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  async function handleSaveAnalysis() {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await saveAnalysisRunToApi(data);
      setIsSaved(true);
      setToastMessage("Review saved");
      setToastAction("history");
      router.refresh();
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : "Review could not be saved.");
      setToastAction(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleWatchSetup() {
    if (isWatching) return;

    setIsWatching(true);
    try {
      await saveWatchlistTickerToApi(data.ticker);
      setIsWatched(true);
      setToastMessage(analysisMode === "review" ? "Setup added to watchlist" : "Ticker added to watchlist");
      setToastAction("watchlist");
      router.refresh();
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : "Ticker could not be added to watchlist.");
      setToastAction(null);
    } finally {
      setIsWatching(false);
    }
  }

  const visibleRisks = buildDisplayRisks(activeComparedSetup, data.risks);
  const riskOpen = data.decision === "pass" || data.decision === "watchlist";

  return (
    <div className="space-y-3">
      <section id="verdict-section">
        <RecommendedSetupHero
          ticker={data.ticker}
          price={data.price}
          decision={data.decision}
          eventRisk={data.eventRisk}
          bestStrategy={data.bestStrategy}
          activeComparedSetup={activeComparedSetup}
          leadSetup={leadSetup}
          analysisMode={analysisMode}
          risks={data.risks}
          explanation={data.explanation}
          metadata={data.metadata}
        />
      </section>

      <section id="payoff-section">
        <PayoffDiagramCard currentPrice={data.price} activeComparedSetup={activeComparedSetup} />
      </section>

      <MetricsRow setup={activeComparedSetup} />

      <div className="pt-1">
        <RiskFlags risks={visibleRisks} isOpen={riskOpen} />
      </div>

      <div className="h-2" />

      <section id="setup-map-section" className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
        <button type="button" onClick={() => setShowPriceContext((value) => !value)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left" aria-expanded={showPriceContext}>
          <span className="text-sm font-medium text-slate-800">Recent price path</span>
          <span className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">{showPriceContext ? "Hide chart" : "Show chart"}</span>
        </button>
        {showPriceContext ? (
          <div className="border-t border-slate-100 p-4">
            <SetupMapCard ticker={data.ticker} currentPrice={data.price} activeComparedSetup={activeComparedSetup} decision={data.decision} />
            <p className="mt-3 text-sm leading-6 text-slate-500">Price is sitting close to your short strike, so there’s less room for error.</p>
          </div>
        ) : null}
      </section>

      <DataTransparencyPanel metadata={data.metadata} />

      <EventMacroRiskPanel
        eventRisk={data.eventRisk}
        eventRisks={data.eventRisks ?? []}
        marketCondition={data.marketCondition}
        volatilityCondition={data.volatilityCondition}
        risks={data.risks}
        metadata={data.metadata}
      />

      <CompareSetupsPreview
        currentPrice={data.price}
        currentComparedSetup={data.currentComparedSetup}
        comparedSetups={comparedSetups}
        saferAlternative={data.saferAlternative}
        aggressiveAlternative={data.aggressiveAlternative}
        activeSetupKey={activeSetupKey}
        onSelectSetup={setActiveSetupKey}
        leadSetup={leadSetup}
        activeComparedSetup={activeComparedSetup}
        analysisMode={analysisMode}
      />

      <TradeoffMatrix leadSetup={leadSetup} activeComparedSetup={activeComparedSetup} decision={data.decision} analysisMode={analysisMode} />

      <AnalyzerDetailTabs
        bestStrategy={data.bestStrategy}
        activeComparedSetup={activeComparedSetup}
        setupContext={evidence?.setupContext ?? null}
        executionContext={evidence?.executionContext ?? null}
        volatilityPremiumContext={evidence?.volatilityPremiumContext ?? null}
        risks={data.risks}
        explanation={data.explanation}
        analysisMode={analysisMode}
      />

      <section id="save-track-section" className="grid gap-2 pt-1 sm:grid-cols-3">
        <button type="button" onClick={handleSaveAnalysis} disabled={isSaving || isSaved} className={["rounded-lg border px-4 py-3 text-sm font-medium transition", isSaved ? "border-slate-300 bg-slate-50 text-slate-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-950", isSaving ? "cursor-wait opacity-75" : ""].join(" ")}>
          {isSaving ? "Saving…" : isSaved ? "Saved ✓" : "Save review"}
        </button>
        <button type="button" onClick={handleWatchSetup} disabled={isWatching || isWatched} className={["rounded-lg border px-4 py-3 text-sm font-medium transition", isWatched ? "border-slate-300 bg-slate-50 text-slate-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-950", isWatching ? "cursor-wait opacity-75" : ""].join(" ")}>
          {isWatching ? "Adding…" : isWatched ? "Added ✓" : watchButtonLabel}
        </button>
        <button type="button" onClick={() => onReanalyze?.()} className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
          Re-analyze
        </button>
      </section>

      <p className="pb-4 text-center text-[11px] text-slate-300">Structural review only, not a trade recommendation. Not financial advice.</p>

      <AnalyzerToast
        message={toastMessage}
        actionLabel={toastAction === "history" ? "View history" : toastAction === "watchlist" ? "View watchlist" : undefined}
        onAction={toastAction === "history" ? () => router.push("/history") : toastAction === "watchlist" ? () => router.push("/watchlist") : undefined}
        onDismiss={() => {
          setToastMessage(null);
          setToastAction(null);
        }}
      />
    </div>
  );
}

function MetricsRow({ setup }: { setup: ComparedSetup | null }) {
  const width = setup?.width;
  const maxLoss = deriveMaxLoss(setup);
  const premiumSubtitle = metricSubtitle("premium", setup);
  const roomSubtitle = metricSubtitle("room", setup);
  const dteSubtitle = metricSubtitle("dte", setup);
  const strikes = setup?.shortStrike != null && setup.longStrike != null ? `${setup.shortStrike}/${setup.longStrike}` : "—";

  return (
    <section className="grid overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm sm:grid-cols-5">
      <Metric label="Strikes" value={strikes} subtitle={width != null ? `$${width.toFixed(0)} wide` : "spread"} helpText="Short strike / long strike for the spread." />
      <Metric label="Premium" value={formatCurrency(setup?.premium)} subtitle={premiumSubtitle.text} subtitleClassName={premiumSubtitle.className} helpText="Credit collected before fees." />
      <Metric label="Max loss" value={formatCurrency(maxLoss)} subtitle="max you can lose" helpText="Largest possible loss on the spread before fees." />
      <Metric label="Room" value={formatPercent(setup?.downsideRoom)} subtitle={roomSubtitle.text} subtitleClassName={roomSubtitle.className} barClassName={roomSubtitle.barClassName} fill={roomSubtitle.fill} helpText="How far the current price is from the short strike." />
      <Metric label="DTE" value={setup?.daysToExpiration?.toString() ?? "—"} subtitle={dteSubtitle.text} subtitleClassName={dteSubtitle.className} barClassName={dteSubtitle.barClassName} fill={dteSubtitle.fill} helpText="Days until expiration." />
    </section>
  );
}

function Metric({
  label,
  value,
  subtitle,
  subtitleClassName = "text-slate-400",
  barClassName,
  fill,
  helpText,
}: {
  label: string;
  value: string;
  subtitle: string;
  subtitleClassName?: string;
  barClassName?: string;
  fill?: number;
  helpText?: string;
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.07em] text-slate-400">
        {label}
        {helpText ? (
          <span
            title={helpText}
            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-200 text-[9px] normal-case tracking-normal text-slate-400"
          >
            ?
          </span>
        ) : null}
      </p>
      <p className="mt-1 font-mono text-[17px] font-semibold leading-tight text-slate-900">{value}</p>
      <p className={`mt-1 text-[11px] font-medium ${subtitleClassName}`}>{subtitle}</p>
      {barClassName ? (
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${fill ?? 0}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function RiskFlags({ risks, isOpen }: { risks: DisplayRiskFlag[]; isOpen: boolean }) {
  const [expanded, setExpanded] = useState(isOpen);
  useEffect(() => setExpanded(isOpen), [isOpen, risks.map((risk) => risk.text).join("|")]);

  return (
    <section className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left" aria-expanded={expanded}>
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Risk flags</span>
        <span className={risks.length > 0 ? "text-[11px] font-bold uppercase tracking-wide text-red-600" : "rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"}>
          {risks.length > 0 ? `${risks.length} flag${risks.length === 1 ? "" : "s"}` : "No flags"}
        </span>
      </button>
      {expanded && risks.length > 0 ? (
        <div className="space-y-2 px-5 pb-4">
          {risks.map((risk) => {
            const classes = risk.severity === "danger" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900";
            const icon = risk.severity === "danger" ? "bg-red-600" : "bg-amber-600";
            return (
              <div key={risk.text} className={`flex gap-3 rounded-lg border px-3 py-3 text-sm leading-6 ${classes}`}>
                <span className={`mt-1 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${icon}`}>!</span>
                <p>{risk.text}</p>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
