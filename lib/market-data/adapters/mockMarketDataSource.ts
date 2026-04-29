import type {
  ImpliedVolatilityLabel,
  MarketDataSource,
  RawUnderlyingSnapshot,
  TrendLabel,
} from "@/lib/market-data/types";
import { getMockTickerProfile } from "@/lib/analyzer/mockData";

function inferTrendLabel(ticker: string): TrendLabel {
  switch (ticker) {
    case "SPY":
    case "QQQ":
    case "AAPL":
    case "NVDA":
    case "XLF":
      return "bullish";
    case "IWM":
      return "neutral";
    default:
      return "neutral";
  }
}

function inferImpliedVolatilityLabel(ticker: string): ImpliedVolatilityLabel {
  switch (ticker) {
    case "NVDA":
      return "high";
    case "SPY":
    case "QQQ":
    case "IWM":
    case "AAPL":
    case "XLF":
      return "moderate";
    default:
      return "moderate";
  }
}

function buildStructureSummary(
  ticker: string,
  marketCondition: string
): string {
  switch (ticker) {
    case "SPY":
      return "Recent price action is holding together above support without a clean breakdown signal.";
    case "QQQ":
      return "Momentum is still constructive, but the index is carrying more short-term stretch and less forgiveness on closer strikes.";
    case "IWM":
      return "The tape is more range-bound, which makes neutral posture more natural than leaning on a strong directional assumption.";
    case "AAPL":
      return "The broader structure is constructive, but single-name reactions still justify more selectivity than the index ETFs.";
    case "NVDA":
      return "The trend remains strong, but the name can reprice quickly enough that nearby short strikes become crowded fast.";
    case "XLF":
      return "The structure is steadier than the higher-beta names, which supports a cleaner defined-risk posture when strikes stay conservative.";
    default:
      return marketCondition;
  }
}

function buildPremiumEnvironmentSummary(
  ticker: string,
  volatilityCondition: string
): string {
  switch (ticker) {
    case "SPY":
      return "The setup needs to win more through structure than through oversized credit.";
    case "QQQ":
      return "The premium is usable, but still not rich enough to justify casual strike placement.";
    case "IWM":
      return "The environment supports balanced neutral premium selling better than forcing a more directional structure.";
    case "AAPL":
      return "Single-name gap risk still matters, so acceptable premium does not automatically make the setup clean.";
    case "NVDA":
      return "The richer premium is being paid for real movement risk rather than easy income.";
    case "XLF":
      return "Modest premium favors simple defined-risk structures instead of overcomplicating the setup.";
    default:
      return volatilityCondition;
  }
}

function buildEventSummary(
  ticker: string,
  eventRisk: RawUnderlyingSnapshot["eventRisk"]
): string {
  switch (eventRisk) {
    case "low":
      return ticker === "XLF" || ticker === "SPY"
        ? "No major immediate catalyst is forcing unusual caution."
        : "Near-term event pressure is limited.";
    case "medium":
      return "Some event sensitivity remains, so the setup should be filtered more selectively.";
    case "high":
      return "The setup carries enough event sensitivity that richer premium alone should not justify entry.";
  }
}

class MockMarketDataSource implements MarketDataSource {
  async getUnderlyingSnapshot(ticker: string): Promise<RawUnderlyingSnapshot> {
    const profile = getMockTickerProfile(ticker);
    const normalizedTicker = profile.ticker;

    return {
      ticker: normalizedTicker,
      price: profile.price,

      trendLabel: inferTrendLabel(normalizedTicker),
      structureSummary: buildStructureSummary(
        normalizedTicker,
        profile.marketCondition
      ),

      impliedVolatilityLabel: inferImpliedVolatilityLabel(normalizedTicker),
      premiumEnvironmentSummary: buildPremiumEnvironmentSummary(
        normalizedTicker,
        profile.volatilityCondition
      ),

      eventRisk: profile.eventRisk,
      eventSummary: buildEventSummary(normalizedTicker, profile.eventRisk),

      decision: profile.decision,
      risks: profile.risks,

      ivRank: null,
      ivHvRatio: null,
      nextEarningsDate: null,
      expectedMoveLow: null,
      expectedMoveHigh: null,
    };
  }
}

export const mockMarketDataSource = new MockMarketDataSource();
