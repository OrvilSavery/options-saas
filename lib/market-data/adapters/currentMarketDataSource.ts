import { getConfiguredMarketDataProvider } from "@/lib/market-data/config";
import { finnhubMarketDataSource } from "@/lib/market-data/adapters/finnhubMarketDataSource";
import { mockMarketDataSource } from "@/lib/market-data/adapters/mockMarketDataSource";
import type { MarketDataSource, RawUnderlyingSnapshot } from "@/lib/market-data/types";

class CurrentMarketDataSource implements MarketDataSource {
  async getUnderlyingSnapshot(ticker: string): Promise<RawUnderlyingSnapshot> {
    const provider = getConfiguredMarketDataProvider();

    if (provider === "finnhub") {
      return finnhubMarketDataSource.getUnderlyingSnapshot(ticker);
    }

    return mockMarketDataSource.getUnderlyingSnapshot(ticker);
  }
}

export const currentMarketDataSource = new CurrentMarketDataSource();