import type { RawOptionContractRow } from "@/lib/options-data/types";
import type { AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";
import type { RequestedStrategyType } from "@/lib/analyzer/entry/types";

interface BuildExactRequestedCreditSpreadArgs {
  ticker: string;
  underlyingPrice: number;
  strategyType: RequestedStrategyType;
  expiration: string;
  shortStrike: number;
  longStrike: number;
  optionRows: RawOptionContractRow[];
  expectedMoveLow?: number | null;
  expectedMoveHigh?: number | null;
  nextEarningsDate?: string | null;
}

function midpoint(bid: number | null, ask: number | null): number | null {
  if (bid == null || ask == null) return null;
  if (bid < 0 || ask < 0) return null;
  return Number(((bid + ask) / 2).toFixed(2));
}

function bidAskWidth(bid: number | null, ask: number | null): number | null {
  if (bid == null || ask == null) return null;
  if (bid < 0 || ask < 0) return null;
  if (ask < bid) return null;
  return Number((ask - bid).toFixed(2));
}

function getDaysToExpiration(expiration: string): number {
  const expirationDate = new Date(`${expiration}T00:00:00Z`);
  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
}

function scoreDownsideBuffer(distancePct: number): number {
  const scaled = Math.min(distancePct / 0.12, 1);
  return Math.max(1, Math.min(10, Math.round(scaled * 10)));
}

function scorePremium(returnOnRisk: number): number {
  const scaled = Math.min(returnOnRisk / 0.35, 1);
  return Math.max(1, Math.min(10, Math.round(scaled * 10)));
}

function scoreSimplicity(width: number): number {
  if (width <= 1) return 10;
  if (width <= 2) return 9;
  if (width <= 5) return 8;
  return 6;
}

function buildSetupLabel(
  ticker: string,
  expiration: string,
  shortStrike: number,
  longStrike: number,
  strategyType: RequestedStrategyType
): string {
  return `${ticker} ${expiration} ${shortStrike}/${longStrike} ${
    strategyType === "put_credit_spread" ? "Put" : "Call"
  } Credit Spread`;
}

function findLeg(
  rows: RawOptionContractRow[],
  optionType: "put" | "call",
  strike: number,
  expiration: string
): RawOptionContractRow | null {
  return (
    rows.find(
      (row) =>
        row.optionType === optionType &&
        row.expiration === expiration &&
        Number(row.strike) === Number(strike)
    ) ?? null
  );
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function buildExactRequestedCreditSpread({
  ticker,
  underlyingPrice,
  strategyType,
  expiration,
  shortStrike,
  longStrike,
  optionRows,
  expectedMoveLow = null,
  expectedMoveHigh = null,
  nextEarningsDate = null,
}: BuildExactRequestedCreditSpreadArgs): AnalyzerStrategyCandidate | null {
  const optionType = strategyType === "put_credit_spread" ? "put" : "call";

  const shortLeg = findLeg(optionRows, optionType, shortStrike, expiration);
  const longLeg = findLeg(optionRows, optionType, longStrike, expiration);

  if (!shortLeg || !longLeg) {
    return null;
  }

  const width = Math.abs(shortStrike - longStrike);
  const shortMid = midpoint(shortLeg.bid, shortLeg.ask);
  const longMid = midpoint(longLeg.bid, longLeg.ask);

  if (width <= 0 || shortMid == null || longMid == null) {
    return null;
  }

  const netCredit = Number((shortMid - longMid).toFixed(2));
  if (!Number.isFinite(netCredit) || netCredit <= 0) {
    return null;
  }

  const maxLoss = Number((width - netCredit).toFixed(2));
  if (!Number.isFinite(maxLoss) || maxLoss <= 0) {
    return null;
  }

  const returnOnRisk = Number((netCredit / maxLoss).toFixed(2));
  const dte = getDaysToExpiration(expiration);

  const distancePct =
    strategyType === "put_credit_spread"
      ? (underlyingPrice - shortStrike) / underlyingPrice
      : (shortStrike - underlyingPrice) / underlyingPrice;

  const shortLegWidth = bidAskWidth(shortLeg.bid, shortLeg.ask);
  const longLegWidth = bidAskWidth(longLeg.bid, longLeg.ask);
  const bidAskPct =
    shortLegWidth != null && longLegWidth != null && netCredit > 0
      ? Number((((shortLegWidth + longLegWidth) / netCredit) * 100).toFixed(2))
      : null;

  const earningsDaysAfter = daysUntil(nextEarningsDate);
  const earningsInWindow =
    earningsDaysAfter != null ? earningsDaysAfter <= dte && earningsDaysAfter >= 0 : null;

  const outsideExpectedMove =
    expectedMoveLow != null && expectedMoveHigh != null
      ? strategyType === "put_credit_spread"
        ? shortStrike < expectedMoveLow && longStrike < expectedMoveLow
        : shortStrike > expectedMoveHigh && longStrike > expectedMoveHigh
      : null;

  return {
    strategy: strategyType === "put_credit_spread" ? "Put Credit Spread" : "Call Credit Spread",
    expiration,
    setupLabel: buildSetupLabel(ticker, expiration, shortStrike, longStrike, strategyType),

    shortStrike,
    longStrike,
    width,
    daysToExpiration: dte,

    premium: netCredit,
    netCredit,
    maxLoss,
    returnOnRisk,

    downsideBufferScore: scoreDownsideBuffer(Math.max(distancePct, 0)),
    premiumScore: scorePremium(returnOnRisk),
    simplicityScore: scoreSimplicity(width),

    shortLegBidAskWidth: shortLegWidth,
    longLegBidAskWidth: longLegWidth,
    shortLegVolume: shortLeg.volume,
    longLegVolume: longLeg.volume,
    shortLegOpenInterest: shortLeg.openInterest,
    longLegOpenInterest: longLeg.openInterest,

    directionalBias: strategyType === "put_credit_spread" ? "bullish" : "bearish",
    role: "balanced",

    strategyType,
    shortDelta: shortLeg.delta != null ? Math.abs(shortLeg.delta) : null,
    ivRank: null,
    ivHvRatio: null,
    creditPctWidth: Number(((netCredit / width) * 100).toFixed(2)),
    maxLossRatio: Number((maxLoss / netCredit).toFixed(2)),
    bidAskPct,
    outsideExpectedMove,
    earningsInWindow,
    earningsDaysAfter,
    expectedMoveLow,
    expectedMoveHigh,
  };
}
