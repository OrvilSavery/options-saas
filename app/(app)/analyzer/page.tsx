"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  AnalysisEvidence,
  AnalysisResponse,
  ComparedSetup,
} from "@/types/analysis";
import AnalyzerResultWorkspace from "@/components/analyzer/AnalyzerResultWorkspace";
import AnalyzerEntryForm from "@/components/analyzer/AnalyzerEntryForm";
import AnalyzerLoadingState from "@/components/analyzer/AnalyzerLoadingState";
import AnalyzerErrorState from "@/components/analyzer/AnalyzerErrorState";
import AnalyzerEmptyState from "@/components/analyzer/AnalyzerEmptyState";
import type { AnalyzeRequest } from "@/lib/analyzer/types/analyzeRequest";
import {
  buildAnalyzeRequestFromReopenState,
  buildAnalyzerInitialState,
} from "@/lib/analyzer/reopen/buildAnalyzerInitialState";
import { MOCK_EXPIRATION } from "@/lib/analyzer/mockData";

function isGroupedEvidence(value: unknown): value is AnalysisEvidence {
  if (!value || typeof value !== "object") return false;
  return (
    "setupContext" in value &&
    "executionContext" in value &&
    "volatilityPremiumContext" in value
  );
}

const initialRequest: AnalyzeRequest = {
  ticker: "",
  mode: "explore",
  strategyType: null,
  expiration: null,
  shortStrike: null,
  longStrike: null,
};

type AnalyzerDisplayMode = "explore" | "review";

function normalizeAnalysisPayload(payload: unknown): AnalysisResponse | null {
  if (!payload || typeof payload !== "object") return null;

  const wrapped = payload as { analysis?: AnalysisResponse };
  if (wrapped.analysis) return wrapped.analysis;

  const direct = payload as AnalysisResponse;
  return typeof direct.ticker === "string" ? direct : null;
}

function buildSetupKey(setup: ComparedSetup | null | undefined): string {
  if (!setup) return "";

  return [
    setup.role,
    setup.strategy,
    setup.expiration,
    setup.shortStrike,
    setup.longStrike,
    setup.width,
    setup.setupLabel,
  ].join("::");
}

function dedupeSetups(setups: Array<ComparedSetup | null | undefined>): ComparedSetup[] {
  const seen = new Set<string>();
  const result: ComparedSetup[] = [];

  for (const setup of setups) {
    if (!setup) continue;
    const key = buildSetupKey(setup);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(setup);
  }

  return result;
}

function findLeadSetup(setups: ComparedSetup[]) {
  return setups.find((setup) => setup.role === "current") ?? setups[0] ?? null;
}

function normalizeAnalysisForDisplay(
  analysis: AnalysisResponse,
  mode: AnalyzerDisplayMode
): AnalysisResponse {
  const dedupedCompared = dedupeSetups([
    analysis.currentComparedSetup,
    ...(analysis.comparedSetups ?? []),
    analysis.saferAlternative,
    analysis.aggressiveAlternative,
  ]);

  const leadSetup = findLeadSetup(dedupedCompared);

  const normalizedCurrentComparedSetup =
    mode === "review"
      ? analysis.currentComparedSetup ??
        dedupedCompared[0] ??
        analysis.saferAlternative ??
        analysis.aggressiveAlternative ??
        null
      : leadSetup ??
        analysis.currentComparedSetup ??
        analysis.saferAlternative ??
        analysis.aggressiveAlternative ??
        null;

  return {
    ...analysis,
    currentComparedSetup: normalizedCurrentComparedSetup,
    comparedSetups: dedupedCompared,
  };
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function normalizeExpDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  return trimmed;
}

function buildCollapsedSummary(
  request: AnalyzeRequest,
  analysis: AnalysisResponse | null,
  mode: AnalyzerDisplayMode
) {
  const setup = analysis?.currentComparedSetup;
  const ticker = analysis?.ticker ?? request.ticker;

  if (mode === "review") {
    const strategy = setup?.strategy ?? request.strategyType ?? "Credit Spread";
    const expiration = formatShortDate(setup?.expiration ?? request.expiration) ?? "expiration";
    const strikes =
      setup?.shortStrike != null && setup?.longStrike != null
        ? `${setup.shortStrike}/${setup.longStrike}`
        : request.shortStrike != null && request.longStrike != null
          ? `${request.shortStrike}/${request.longStrike}`
          : "strikes";
    return `${ticker} · ${strategy} · ${expiration} · ${strikes}`;
  }

  const screened = analysis?.metadata?.exploreContext?.screenedExpirationCount;
  const windowLabel = analysis?.metadata?.reviewScope?.expirationWindowLabel ?? "7–60 DTE window";
  return screened ? `${ticker} · Screened ${screened} expirations · ${windowLabel}` : `${ticker} · Find setups · ${windowLabel}`;
}

export default function AnalyzerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [request, setRequest] = useState<AnalyzeRequest>(initialRequest);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalyzerDisplayMode>("explore");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEntryExpanded, setIsEntryExpanded] = useState(true);

  const autorunKeyRef = useRef<string | null>(null);

  const groupedEvidence = useMemo(() => {
    if (!analysis) return null;
    return isGroupedEvidence(analysis.evidence) ? analysis.evidence : null;
  }, [analysis]);

  useEffect(() => {
    const title = analysis
      ? `${analysis.ticker} · ${analysis.decision === "valid" ? "Valid setup" : analysis.decision === "watchlist" ? "Watchlist" : "Pass"} — EntryCheck`
      : "Analyzer — EntryCheck";
    document.title = title;
  }, [analysis]);

  useEffect(() => {
    const reopenState = buildAnalyzerInitialState(searchParams);
    let nextRequest = buildAnalyzeRequestFromReopenState(reopenState);

    // For non-autorun review mode: replace stale/past expirations with mock defaults
    // so the form is immediately usable without requiring the user to know the mock date.
    if (nextRequest.mode === "review" && !reopenState.autorun) {
      const today = new Date().toISOString().slice(0, 10);
      const isStaleExp = !nextRequest.expiration || nextRequest.expiration < today;
      if (isStaleExp) {
        nextRequest = {
          ...nextRequest,
          expiration: MOCK_EXPIRATION.dateStr,
          shortStrike: nextRequest.shortStrike ?? 518,
          longStrike: nextRequest.longStrike ?? 513,
        };
      }
    }

    if (
      nextRequest.ticker ||
      nextRequest.expiration ||
      nextRequest.shortStrike != null ||
      nextRequest.longStrike != null ||
      nextRequest.strategyType
    ) {
      setRequest(nextRequest);
    }
  }, [searchParams]);

  const handleRequestChange = useCallback(
    (nextRequest: AnalyzeRequest) => {
      const currentMode: AnalyzerDisplayMode =
        request.mode === "review" ? "review" : "explore";
      const nextMode: AnalyzerDisplayMode =
        nextRequest.mode === "review" ? "review" : "explore";

      setRequest(nextRequest);

      if (currentMode !== nextMode) {
        setAnalysis(null);
        setError(null);
        setIsLoading(false);
        setAnalysisMode(nextMode);
        setIsEntryExpanded(true);
        autorunKeyRef.current = null;
        router.replace("/analyzer");
      }
    },
    [request.mode, router]
  );

  const runAnalysis = useCallback(
    async (overrideRequest?: AnalyzeRequest) => {
      const activeRequest = overrideRequest ?? request;
      const requestedMode: AnalyzerDisplayMode =
        activeRequest.mode === "review" ? "review" : "explore";

      if (!activeRequest.ticker.trim()) {
        setError("Ticker is required.");
        setAnalysis(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...activeRequest,
            expiration: normalizeExpDate(activeRequest.expiration),
            strategy: activeRequest.strategyType,
          }),
        });

        const payload = (await response.json()) as unknown;
        const normalized = normalizeAnalysisPayload(payload);
        const wrapped = payload as { error?: string };

        if (!response.ok) {
          throw new Error(wrapped?.error ?? "Analysis failed.");
        }

        if (!normalized) {
          throw new Error("Analysis response was missing analysis payload.");
        }

        setAnalysisMode(requestedMode);
        setAnalysis(normalizeAnalysisForDisplay(normalized, requestedMode));
        setIsEntryExpanded(false);
      } catch (err) {
        setAnalysis(null);
        setError(err instanceof Error ? err.message : "Analysis failed.");
        setIsEntryExpanded(true);
      } finally {
        setIsLoading(false);
      }
    },
    [request]
  );

  useEffect(() => {
    const reopenState = buildAnalyzerInitialState(searchParams);
    if (!reopenState.autorun || !reopenState.ticker) return;

    const nextRequest = buildAnalyzeRequestFromReopenState(reopenState);
    const autorunKey = JSON.stringify(nextRequest);

    if (autorunKeyRef.current === autorunKey) return;
    autorunKeyRef.current = autorunKey;

    setRequest(nextRequest);
    void runAnalysis(nextRequest);
  }, [runAnalysis, searchParams]);

  const collapsedSummary = buildCollapsedSummary(request, analysis, analysisMode);

  return (
    <div className="mx-auto w-full max-w-[740px] space-y-4 pb-14">
      <AnalyzerEntryForm
        value={request}
        onChange={handleRequestChange}
        onSubmit={() => runAnalysis()}
        isLoading={isLoading}
        isCollapsed={Boolean(analysis) && !isEntryExpanded && !isLoading}
        onExpand={() => { setIsEntryExpanded(true); setAnalysis(null); setError(null); router.replace("/analyzer"); }}
        summary={collapsedSummary}
      />

      {isLoading ? (
        <AnalyzerLoadingState
          mode={request.mode === "review" ? "review" : "explore"}
          ticker={request.ticker}
        />
      ) : null}

      {!isLoading && error ? (
        <AnalyzerErrorState message={error} onRetry={() => runAnalysis()} />
      ) : null}

      {!isLoading && !error && !analysis ? <AnalyzerEmptyState /> : null}

      {!isLoading && analysis ? (
        <AnalyzerResultWorkspace
          data={analysis}
          evidence={groupedEvidence}
          analysisMode={analysisMode}
          onReanalyze={() => runAnalysis()}
        />
      ) : null}
    </div>
  );
}
