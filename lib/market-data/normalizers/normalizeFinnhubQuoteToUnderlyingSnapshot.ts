import { MarketDataUnavailableError } from "@/lib/market-data/errors";
import type {
  ImpliedVolatilityLabel,
  RawUnderlyingSnapshot,
  TrendLabel,
} from "@/lib/market-data/types";

interface FinnhubQuoteResponse {
  c: number; // current price
  h: number; // high price of the day
  l: number; // low price of the day
  o: number; // open price of the day
  pc: number; // previous close price
  t: number; // timestamp
}

function inferTrendLabel(quote: FinnhubQuoteResponse): TrendLabel {
  if (quote.pc > 0 && quote.c >= quote.pc * 1.01) {
    return "bullish";
  }

  if (quote.pc > 0 && quote.c <= quote.pc * 0.99) {
    return "bearish";
  }

  return "neutral";
}

function getIntradayRangePercent(quote: FinnhubQuoteResponse): number {
  if (quote.c <= 0) return 0;
  return ((quote.h - quote.l) / quote.c) * 100;
}

function getMoveFromPreviousClosePercent(quote: FinnhubQuoteResponse): number {
  if (quote.pc <= 0) return 0;
  return Math.abs(((quote.c - quote.pc) / quote.pc) * 100);
}

function inferImpliedVolatilityLabel(
  quote: FinnhubQuoteResponse
): ImpliedVolatilityLabel {
  const intradayRangePercent = getIntradayRangePercent(quote);

  if (intradayRangePercent >= 3.5) {
    return "high";
  }

  if (intradayRangePercent >= 1.5) {
    return "moderate";
  }

  return "low";
}

function inferEventRiskFromQuote(
  quote: FinnhubQuoteResponse
): RawUnderlyingSnapshot["eventRisk"] {
  const intradayRangePercent = getIntradayRangePercent(quote);
  const moveFromPreviousClosePercent = getMoveFromPreviousClosePercent(quote);

  if (intradayRangePercent >= 5 || moveFromPreviousClosePercent >= 4) {
    return "high";
  }

  if (intradayRangePercent >= 3 || moveFromPreviousClosePercent >= 2) {
    return "medium";
  }

  return "low";
}

function buildStructureSummary(
  quote: FinnhubQuoteResponse,
  trendLabel: TrendLabel
): string {
  const range = quote.h - quote.l;
  const nearHigh = range > 0 ? quote.c >= quote.h - range * 0.2 : false;
  const nearLow = range > 0 ? quote.c <= quote.l + range * 0.2 : false;

  if (trendLabel === "bullish" && nearHigh) {
    return "Price is trading constructively and sitting toward the upper end of the day’s range.";
  }

  if (trendLabel === "bearish" && nearLow) {
    return "Price is weakening and sitting toward the lower end of the day’s range.";
  }

  if (trendLabel === "neutral") {
    return "Price is mixed intraday and not showing a decisive directional edge from the quote snapshot alone.";
  }

  return "Price is moving directionally, but the quote snapshot alone still gives only a first-pass structure read.";
}

function buildPremiumEnvironmentSummary(
  volLabel: ImpliedVolatilityLabel
): string {
  switch (volLabel) {
    case "low":
      return "This is a first-pass proxy from the current trading range, so full options-derived premium context is still not live yet.";
    case "moderate":
      return "This is a first-pass proxy from the current trading range, which is workable for now but not a substitute for full options-derived volatility context.";
    case "high":
      return "The current trading range is elevated, but this is still only a first-pass proxy until full options-derived volatility context is connected.";
  }
}

function buildEventSummary(
  eventRisk: RawUnderlyingSnapshot["eventRisk"]
): string {
  switch (eventRisk) {
    case "low":
      return "No obvious catalyst pressure is being inferred from the live quote behavior right now, but this is only a bounded price-action proxy and not a live event-calendar or news check.";
    case "medium":
      return "Some catalyst pressure may be present based on the current quote behavior, but this remains a bounded proxy rather than a confirmed live event feed.";
    case "high":
      return "Current quote behavior suggests elevated catalyst pressure could be present, but this is still a bounded proxy rather than a confirmed live event-calendar or headline feed.";
  }
}

function assertUsableFinnhubQuote(
  ticker: string,
  quote: FinnhubQuoteResponse
): void {
  if (!Number.isFinite(quote.c) || quote.c <= 0) {
    throw new MarketDataUnavailableError(
      `Live quote data is unavailable or invalid for ${ticker}.`
    );
  }

  if (
    !Number.isFinite(quote.h) ||
    !Number.isFinite(quote.l) ||
    !Number.isFinite(quote.o)
  ) {
    throw new MarketDataUnavailableError(
      `Live quote data is incomplete for ${ticker}.`
    );
  }

  if (!Number.isFinite(quote.pc) || quote.pc < 0) {
    throw new MarketDataUnavailableError(
      `Previous close data is unavailable or invalid for ${ticker}.`
    );
  }
}

export function normalizeFinnhubQuoteToUnderlyingSnapshot(
  ticker: string,
  quote: FinnhubQuoteResponse
): RawUnderlyingSnapshot {
  assertUsableFinnhubQuote(ticker, quote);

  const trendLabel = inferTrendLabel(quote);
  const impliedVolatilityLabel = inferImpliedVolatilityLabel(quote);
  const eventRisk = inferEventRiskFromQuote(quote);

  return {
    ticker: ticker.trim().toUpperCase(),
    price: quote.c,

    trendLabel,
    structureSummary: buildStructureSummary(quote, trendLabel),

    impliedVolatilityLabel,
    premiumEnvironmentSummary: buildPremiumEnvironmentSummary(
      impliedVolatilityLabel
    ),

    eventRisk,
    eventSummary: buildEventSummary(eventRisk),

    // Legacy fields retained to avoid upstream contract breakage.
    // Final posture and user-facing risks should still be derived downstream.
    decision: "watchlist",
    risks: [],
  };
}