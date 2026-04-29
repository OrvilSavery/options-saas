import type {
  DirectionalBias,
  RawOptionsCandidate,
} from "@/lib/market-data/types";
import type {
  OptionsCandidateSource,
  RawOptionContractRow,
} from "@/lib/options-data/types";
import { getMockTickerProfile } from "@/lib/analyzer/mockData";

function parseStrikesFromSetupLabel(
  setupLabel: string
): { shortStrike: number; longStrike: number } {
  const strikeSectionMatch = setupLabel.match(
    /(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?))?/
  );

  if (!strikeSectionMatch) {
    throw new Error(`Unable to parse strikes from setup label: ${setupLabel}`);
  }

  return {
    shortStrike: Number(strikeSectionMatch[1]),
    longStrike: Number(strikeSectionMatch[2]),
  };
}

function inferDirectionalBias(strategy: string): DirectionalBias {
  if (strategy.toLowerCase().includes("put credit")) {
    return "bullish";
  }

  if (strategy.toLowerCase().includes("call credit")) {
    return "bearish";
  }

  return "neutral";
}

function inferOptionType(strategy: string): "put" | "call" {
  return strategy.toLowerCase().includes("call") ? "call" : "put";
}

function inferStrategyType(
  strategy: string
): "put_credit_spread" | "call_credit_spread" | "other" {
  const lowered = strategy.toLowerCase();

  if (lowered.includes("put credit")) {
    return "put_credit_spread";
  }

  if (lowered.includes("call credit")) {
    return "call_credit_spread";
  }

  return "other";
}

function computeDaysToExpiration(expiration: string): number {
  const expirationDate = new Date(`${expiration}T00:00:00Z`);
  const now = new Date();

  const diffMs = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(diffDays, 0);
}

function roundToTwo(value: number): number {
  return Number(value.toFixed(2));
}

function buildSyntheticLegMarkets(premium: number | null) {
  const credit = premium ?? 0.5;

  const longMid = 0.2;
  const shortMid = longMid + credit;

  return {
    shortBid: roundToTwo(Math.max(shortMid - 0.05, 0.01)),
    shortAsk: roundToTwo(shortMid + 0.05),
    longBid: roundToTwo(Math.max(longMid - 0.03, 0.01)),
    longAsk: roundToTwo(longMid + 0.03),
  };
}

function buildExpectedMoveBounds(price: number) {
  const movePct = 0.045;
  return {
    low: roundToTwo(price * (1 - movePct)),
    high: roundToTwo(price * (1 + movePct)),
  };
}

function inferRoleDelta(
  role: "safer" | "balanced" | "aggressive"
): number {
  switch (role) {
    case "safer":
      return 0.16;
    case "balanced":
      return 0.21;
    case "aggressive":
      return 0.29;
    default:
      return 0.21;
  }
}

function inferIvRank(ticker: string): number {
  switch (ticker.trim().toUpperCase()) {
    case "NVDA":
      return 72;
    case "QQQ":
      return 49;
    case "AAPL":
      return 44;
    case "SPY":
      return 41;
    case "XLF":
      return 38;
    case "DIA":
      return 43;
    default:
      return 46;
  }
}

function inferIvHvRatio(ticker: string): number {
  switch (ticker.trim().toUpperCase()) {
    case "NVDA":
      return 1.42;
    case "QQQ":
      return 1.18;
    case "AAPL":
      return 1.12;
    case "SPY":
      return 1.08;
    case "XLF":
      return 1.05;
    case "DIA":
      return 1.1;
    default:
      return 1.14;
  }
}

class MockOptionsDataSource implements OptionsCandidateSource {
  async getOptionsChainForExpiration(
    ticker: string,
    expiration: string
  ): Promise<RawOptionContractRow[]> {
    const profile = getMockTickerProfile(ticker);

    const rows = new Map<string, RawOptionContractRow>();

    for (const candidate of profile.candidateStrategies) {
      if (candidate.expiration !== expiration) continue;
      if (
        !candidate.strategy.toLowerCase().includes("put credit") &&
        !candidate.strategy.toLowerCase().includes("call credit")
      ) {
        continue;
      }

      const { shortStrike, longStrike } = parseStrikesFromSetupLabel(
        candidate.setupLabel
      );
      const optionType = inferOptionType(candidate.strategy);
      const markets = buildSyntheticLegMarkets(candidate.premium);

      const shortKey = `${expiration}::${optionType}::${shortStrike}`;
      const longKey = `${expiration}::${optionType}::${longStrike}`;

      if (!rows.has(shortKey)) {
        rows.set(shortKey, {
          symbol: `${ticker}-${expiration}-${shortStrike}-${optionType}-short`,
          optionType,
          strike: shortStrike,
          expiration,
          bid: markets.shortBid,
          ask: markets.shortAsk,
          last: roundToTwo((markets.shortBid + markets.shortAsk) / 2),
          volume: 100,
          openInterest: 250,
          delta: optionType === "put" ? -0.2 : 0.2,
          iv: 0.28,
        });
      }

      if (!rows.has(longKey)) {
        rows.set(longKey, {
          symbol: `${ticker}-${expiration}-${longStrike}-${optionType}-long`,
          optionType,
          strike: longStrike,
          expiration,
          bid: markets.longBid,
          ask: markets.longAsk,
          last: roundToTwo((markets.longBid + markets.longAsk) / 2),
          volume: 80,
          openInterest: 180,
          delta: optionType === "put" ? -0.1 : 0.1,
          iv: 0.27,
        });
      }
    }

    return Array.from(rows.values());
  }

  async getOptionsCandidates(ticker: string): Promise<RawOptionsCandidate[]> {
    const profile = getMockTickerProfile(ticker);
    const expectedMove = buildExpectedMoveBounds(profile.price);
    const ivRank = inferIvRank(profile.ticker);
    const ivHvRatio = inferIvHvRatio(profile.ticker);

    return profile.candidateStrategies
      .filter(
        (candidate) =>
          candidate.strategy.toLowerCase().includes("put credit") ||
          candidate.strategy.toLowerCase().includes("call credit")
      )
      .map((candidate) => {
        const { shortStrike, longStrike } = parseStrikesFromSetupLabel(
          candidate.setupLabel
        );

        const width = Math.abs(shortStrike - longStrike);
        const netCredit = candidate.premium;
        const maxLoss =
          netCredit != null ? Math.max(width - netCredit, 0) : null;
        const strategyType = inferStrategyType(candidate.strategy);
        const optionType = inferOptionType(candidate.strategy);
        const shortLegBidAskWidth = 0.1;
        const longLegBidAskWidth = 0.06;
        const bidAskPct =
          netCredit != null && netCredit > 0
            ? roundToTwo(((shortLegBidAskWidth + longLegBidAskWidth) / netCredit) * 100)
            : null;
        const creditPctWidth =
          netCredit != null && width > 0 ? roundToTwo((netCredit / width) * 100) : null;
        const maxLossRatio =
          netCredit != null && netCredit > 0 && maxLoss != null
            ? roundToTwo(maxLoss / netCredit)
            : null;
        const shortDeltaBase = inferRoleDelta(candidate.role);
        const shortDelta = optionType === "put" ? -shortDeltaBase : shortDeltaBase;
        const outsideExpectedMove =
          optionType === "put"
            ? shortStrike < expectedMove.low && longStrike < expectedMove.low
            : shortStrike > expectedMove.high && longStrike > expectedMove.high;

        return {
          strategy: candidate.strategy,
          expiration: candidate.expiration,
          setupLabel: candidate.setupLabel,

          shortStrike,
          longStrike,
          width,
          daysToExpiration: computeDaysToExpiration(candidate.expiration),

          premium: candidate.premium,
          netCredit,
          maxLoss,
          returnOnRisk: candidate.returnOnRisk,

          downsideBufferScore: candidate.downsideBufferScore,
          premiumScore: candidate.premiumScore,
          simplicityScore: candidate.simplicityScore,

          shortLegBidAskWidth,
          longLegBidAskWidth,
          shortLegVolume: 100,
          longLegVolume: 80,
          shortLegOpenInterest: 250,
          longLegOpenInterest: 180,

          directionalBias: inferDirectionalBias(candidate.strategy),
          role: candidate.role,

          strategyType,
          shortDelta,
          ivRank,
          ivHvRatio,
          creditPctWidth,
          maxLossRatio,
          bidAskPct,
          outsideExpectedMove,
          earningsInWindow: false,
          earningsDaysAfter: null,
          expectedMoveLow: expectedMove.low,
          expectedMoveHigh: expectedMove.high,
        };
      });
  }
}

export const mockOptionsDataSource = new MockOptionsDataSource();
