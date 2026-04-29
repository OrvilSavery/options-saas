import { getMockTickerProfile } from "@/lib/analyzer/mockData";
import type { AnalyzerInput, AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";

function parseFirstTwoStrikes(setupLabel: string): [number | null, number | null] {
  const match = setupLabel.match(/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/);
  if (!match) return [null, null];

  const first = Number(match[1]);
  const second = Number(match[2]);

  return [
    Number.isFinite(first) ? first : null,
    Number.isFinite(second) ? second : null,
  ];
}

function inferDirectionalBias(strategy: string): AnalyzerStrategyCandidate["directionalBias"] {
  const lower = strategy.toLowerCase();

  if (lower.includes("call") && lower.includes("credit")) return "bearish";
  if (lower.includes("put") && lower.includes("credit")) return "bullish";

  return "neutral";
}

function inferStrategyType(strategy: string): AnalyzerStrategyCandidate["strategyType"] {
  const lower = strategy.toLowerCase();

  if (lower.includes("put") && lower.includes("credit")) return "put_credit_spread";
  if (lower.includes("call") && lower.includes("credit")) return "call_credit_spread";

  return "other";
}

function buildCandidate(
  candidate: ReturnType<typeof getMockTickerProfile>["candidateStrategies"][number],
  underlyingPrice: number
): AnalyzerStrategyCandidate {
  const [parsedShort, parsedLong] = parseFirstTwoStrikes(candidate.setupLabel);
  const directionalBias = inferDirectionalBias(candidate.strategy);
  const shortStrike = parsedShort ?? Number((underlyingPrice * 0.97).toFixed(2));
  const longStrike =
    parsedLong ??
    (directionalBias === "bearish"
      ? Number((shortStrike + 5).toFixed(2))
      : Number((shortStrike - 5).toFixed(2)));

  const width = Math.max(Math.abs(shortStrike - longStrike), 1);
  const netCredit = candidate.premium;
  const maxLoss = netCredit == null ? null : Number(Math.max(width - netCredit, 0).toFixed(2));

  return {
    strategy: candidate.strategy,
    expiration: candidate.expiration,
    setupLabel: candidate.setupLabel,

    shortStrike,
    longStrike,
    width,
    daysToExpiration: 21,

    premium: candidate.premium,
    netCredit,
    maxLoss,
    returnOnRisk: candidate.returnOnRisk,

    downsideBufferScore: candidate.downsideBufferScore,
    premiumScore: candidate.premiumScore,
    simplicityScore: candidate.simplicityScore,

    shortLegBidAskWidth: 0.08,
    longLegBidAskWidth: 0.08,
    shortLegVolume: 250,
    longLegVolume: 150,
    shortLegOpenInterest: 1000,
    longLegOpenInterest: 800,

    directionalBias,
    role: candidate.role,

    strategyType: inferStrategyType(candidate.strategy),
    shortDelta: 0.2,
    ivRank: 55,
    ivHvRatio: 1.2,
    creditPctWidth: netCredit == null ? null : Number(((netCredit / width) * 100).toFixed(2)),
    maxLossRatio:
      netCredit == null || maxLoss == null || netCredit <= 0
        ? null
        : Number((maxLoss / netCredit).toFixed(2)),
    bidAskPct: 8,
    outsideExpectedMove: true,
    earningsInWindow: false,
    earningsDaysAfter: null,
    expectedMoveLow: null,
    expectedMoveHigh: null,
  };
}

export function buildMockAnalyzerInput(ticker: string): AnalyzerInput {
  const profile = getMockTickerProfile(ticker);

  return {
    ticker: profile.ticker,
    underlyingPrice: profile.price,

    marketContext: {
      summary: profile.marketCondition,
    },

    volatilityContext: {
      summary: profile.volatilityCondition,
      impliedVolatilityLabel: "moderate",
    },

    expectedMoveContext: {
      expectedMoveLow: null,
      expectedMoveHigh: null,
    },

    eventContext: {
      risk: profile.eventRisk,
      nextEarningsDate: null,
      eventSourceQuality: "mock",
      scheduledEvents: [],
    },

    decisionContext: {
      decision: profile.decision,
      risks: profile.risks,
    },

    candidateStrategies: profile.candidateStrategies.map((candidate) =>
      buildCandidate(candidate, profile.price)
    ),
  };
}
