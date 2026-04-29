import type { SeededAnalyzerInput } from "@/lib/analyzer/input/seeded/types";
import { MOCK_EXPIRATION } from "@/lib/analyzer/mockData";

const D = MOCK_EXPIRATION.dateStr;
const L = MOCK_EXPIRATION.label;

export const validSeededAnalyzerInputFixture: SeededAnalyzerInput = {
  ticker: "SPY",
  underlyingPrice: 542.31,

  marketContext: {
    summary: "Constructive to bullish. Recent price action is holding together above support without a clean breakdown signal.",
  },

  volatilityContext: {
    summary: "Premium is workable. The setup needs to win more through structure than through oversized credit.",
    impliedVolatilityLabel: "moderate",
  },

  expectedMoveContext: {
    expectedMoveLow: 530,
    expectedMoveHigh: 555,
  },

  eventContext: {
    risk: "low",
    nextEarningsDate: null,
    eventSourceQuality: "mock",
    scheduledEvents: [],
  },

  decisionContext: {
    decision: "valid",
    risks: [
      "A broad market selloff could test the short strike faster than the premium suggests.",
      "A volatility expansion could pressure the spread before expiration even if price is still above the short strike.",
    ],
  },

  candidateStrategies: [
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `SPY ${L} 518/513 Put Credit Spread`,

      shortStrike: 518,
      longStrike: 513,
      width: 5,
      daysToExpiration: 35,

      premium: 1.42,
      netCredit: 1.42,
      maxLoss: 3.58,
      returnOnRisk: 0.39,

      downsideBufferScore: 7,
      premiumScore: 8,
      simplicityScore: 9,

      shortLegBidAskWidth: 0.05,
      longLegBidAskWidth: 0.05,
      shortLegVolume: 250,
      longLegVolume: 175,
      shortLegOpenInterest: 1200,
      longLegOpenInterest: 900,

      directionalBias: "bullish",
      role: "balanced",

      strategyType: "put_credit_spread",
      shortDelta: 0.21,
      creditPctWidth: 28,
      maxLossRatio: 2.52,
      bidAskPct: 9,
      outsideExpectedMove: true,
      earningsInWindow: false,
      earningsDaysAfter: null,
      expectedMoveLow: 530,
      expectedMoveHigh: 555,
      ivRank: 41,
      ivHvRatio: 1.08,
    },
  ],
};

export const invalidSeededAnalyzerInputFixture: SeededAnalyzerInput = {
  ticker: "",
  underlyingPrice: -1,

  marketContext: {
    summary: "",
  },

  volatilityContext: {
    summary: "",
    impliedVolatilityLabel: "low",
  },

  expectedMoveContext: {
    expectedMoveLow: null,
    expectedMoveHigh: null,
  },

  eventContext: {
    risk: "medium",
    nextEarningsDate: null,
    eventSourceQuality: "mock",
    scheduledEvents: [],
  },

  decisionContext: {
    decision: "watchlist",
    risks: [""],
  },

  candidateStrategies: [
    {
      strategy: "",
      expiration: "",
      setupLabel: "",

      shortStrike: -10,
      longStrike: -15,
      width: 0,
      daysToExpiration: -1,

      premium: null,
      netCredit: null,
      maxLoss: null,
      returnOnRisk: null,

      downsideBufferScore: 0,
      premiumScore: 0,
      simplicityScore: 0,

      shortLegBidAskWidth: null,
      longLegBidAskWidth: null,
      shortLegVolume: null,
      longLegVolume: null,
      shortLegOpenInterest: null,
      longLegOpenInterest: null,

      directionalBias: "neutral",
      role: "balanced",

      strategyType: "other",
      shortDelta: null,
      creditPctWidth: null,
      maxLossRatio: null,
      bidAskPct: null,
      outsideExpectedMove: null,
      earningsInWindow: null,
      earningsDaysAfter: null,
      expectedMoveLow: null,
      expectedMoveHigh: null,
      ivRank: null,
      ivHvRatio: null,
    },
  ],
};
