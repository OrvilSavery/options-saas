import type { AnalyzerInput, AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";
import type { CreditSpreadEngineParams } from "@/lib/analyzer/scoring/credit-spread/types";
import type { RawOptionContractRow } from "@/lib/options-data/types";

export function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export const baseEngineParams: CreditSpreadEngineParams = {
  ivRank: 62,
  ivHvRatio: 1.28,
  dte: 35,
  shortDelta: 0.18,
  creditPctWidth: 28,
  maxLossRatio: 2.57,
  outsideEM: true,
  earningsInWindow: false,
  earningsDaysAfter: null,
  bidAskPct: 8,
};

export function makeCandidate(
  overrides: Partial<AnalyzerStrategyCandidate> = {}
): AnalyzerStrategyCandidate {
  const shortStrike = overrides.shortStrike ?? 525;
  const longStrike = overrides.longStrike ?? 520;
  const width = Math.abs(shortStrike - longStrike);
  const netCredit = overrides.netCredit ?? overrides.premium ?? 1.4;
  const maxLoss = overrides.maxLoss ?? Number((width - netCredit).toFixed(2));

  return {
    strategy: "Put Credit Spread",
    expiration: futureDate(35),
    setupLabel: `SPY ${futureDate(35)} ${shortStrike}/${longStrike} Put Credit Spread`,
    shortStrike,
    longStrike,
    width,
    daysToExpiration: 35,
    premium: netCredit,
    netCredit,
    maxLoss,
    returnOnRisk: Number((netCredit / maxLoss).toFixed(2)),
    downsideBufferScore: 8,
    premiumScore: 7,
    simplicityScore: 8,
    shortLegBidAskWidth: 0.05,
    longLegBidAskWidth: 0.04,
    shortLegVolume: 350,
    longLegVolume: 210,
    shortLegOpenInterest: 1200,
    longLegOpenInterest: 850,
    directionalBias: "bullish",
    role: "balanced",
    strategyType: "put_credit_spread",
    shortDelta: 0.18,
    ivRank: 62,
    ivHvRatio: 1.28,
    creditPctWidth: Number(((netCredit / width) * 100).toFixed(2)),
    maxLossRatio: Number((maxLoss / netCredit).toFixed(2)),
    bidAskPct: 8,
    outsideExpectedMove: true,
    earningsInWindow: false,
    earningsDaysAfter: null,
    expectedMoveLow: 530,
    expectedMoveHigh: 570,
    ...overrides,
  };
}

export function makeAnalyzerInput(
  overrides: Partial<AnalyzerInput> = {},
  candidateOverrides: Partial<AnalyzerStrategyCandidate> = {}
): AnalyzerInput {
  const candidate = makeCandidate(candidateOverrides);

  return {
    ticker: "SPY",
    underlyingPrice: 550,
    marketContext: {
      summary: "Price is above the short put strike.",
    },
    volatilityContext: {
      summary: "Premium environment is supportive.",
      impliedVolatilityLabel: "moderate",
    },
    expectedMoveContext: {
      expectedMoveLow: 530,
      expectedMoveHigh: 570,
    },
    eventContext: {
      risk: "low",
      nextEarningsDate: null,
      eventSourceQuality: "mock",
      scheduledEvents: [],
    },
    decisionContext: {
      decision: "valid",
      risks: [],
    },
    candidateStrategies: [candidate],
    ...overrides,
  };
}

export function makeOptionRow(
  overrides: Partial<RawOptionContractRow> = {}
): RawOptionContractRow {
  return {
    symbol: overrides.symbol ?? "SPY260515P00525000",
    optionType: overrides.optionType ?? "put",
    strike: overrides.strike ?? 525,
    expiration: overrides.expiration ?? futureDate(35),
    bid: overrides.bid ?? 1.5,
    ask: overrides.ask ?? 1.6,
    last: overrides.last ?? 1.55,
    volume: overrides.volume ?? 300,
    openInterest: overrides.openInterest ?? 1000,
    delta: overrides.delta ?? -0.18,
    iv: overrides.iv ?? 0.22,
    ...overrides,
  };
}
