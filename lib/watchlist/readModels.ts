import type { AnalysisResponse, ComparedSetup } from "@/types/analysis";
import type { WatchlistTickerReviewSummary } from "@/lib/watchlist/types";

function firstSentence(text: string | null | undefined) {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^.*?[.!?](\s|$)/);
  return match ? match[0].trim() : trimmed;
}

function buildSetupSummaryTarget(analysis: AnalysisResponse): ComparedSetup | null {
  return analysis.currentComparedSetup ?? analysis.comparedSetups?.[0] ?? null;
}

function normalizeAnalysisPayload(payload: unknown): AnalysisResponse | null {
  if (!payload || typeof payload !== "object") return null;

  const maybeWrapped = payload as { analysis?: AnalysisResponse };
  if (maybeWrapped.analysis) return maybeWrapped.analysis;

  const maybeDirect = payload as AnalysisResponse;
  return maybeDirect?.ticker ? maybeDirect : null;
}

function postureRank(posture: string | null) {
  switch (posture) {
    case "valid":
      return 0;
    case "watchlist":
      return 1;
    case "pass":
      return 2;
    default:
      return 3;
  }
}

function normalizeStrategy(strategy: string | null | undefined) {
  if (!strategy) return null;
  const trimmed = strategy.trim();
  return trimmed || null;
}

export async function fetchAnalysisForTicker(
  ticker: string
): Promise<AnalysisResponse | null> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticker,
        mode: "explore",
      }),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as unknown;
    return normalizeAnalysisPayload(payload);
  } catch {
    return null;
  }
}

function buildWatchlistTickerReviewSummary(
  analysis: AnalysisResponse
): WatchlistTickerReviewSummary {
  const setup = buildSetupSummaryTarget(analysis);

  return {
    ticker: analysis.ticker,
    posture: analysis.decision,
    strategy: normalizeStrategy(setup?.strategy ?? analysis.bestStrategy?.strategy ?? null),
    expiration: setup?.expiration ?? null,
    shortStrike: setup?.shortStrike ?? null,
    longStrike: setup?.longStrike ?? null,
    rationale: firstSentence(setup?.note) ?? firstSentence(analysis.explanation),
    riskFlags: analysis.risks.slice(0, 2),
    underlyingPrice: analysis.price ?? null,
    refreshedAt: new Date().toISOString(),
  };
}

export async function loadWatchlistReviewSummaries(rawTickers: string[]) {
  const tickers = Array.from(
    new Set(
      rawTickers
        .map((ticker) => String(ticker ?? "").trim().toUpperCase())
        .filter(Boolean)
    )
  );

  const summaries = await Promise.all(
    tickers.map(async (ticker) => {
      const analysis = await fetchAnalysisForTicker(ticker);

      if (!analysis) {
        return {
          ticker,
          posture: null,
          strategy: null,
          expiration: null,
          shortStrike: null,
          longStrike: null,
          rationale: "Current review could not be refreshed right now.",
          riskFlags: [],
          underlyingPrice: null,
          refreshedAt: new Date().toISOString(),
        };
      }

      return buildWatchlistTickerReviewSummary(analysis);
    })
  );

  return summaries.sort((a, b) => {
    const postureDelta = postureRank(a.posture) - postureRank(b.posture);
    if (postureDelta !== 0) return postureDelta;
    return a.ticker.localeCompare(b.ticker);
  });
}
