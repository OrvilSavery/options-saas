import type { RawOptionsCandidate } from "@/lib/market-data/types";
import type { RawOptionContractRow } from "@/lib/options-data/types";
import { getConfiguredOptionsDataProvider } from "@/lib/options-data/config";
import { tradierOptionsDataSource } from "@/lib/options-data/adapters/tradierOptionsDataSource";
import { mockOptionsDataSource } from "@/lib/market-data/adapters/mockOptionsDataSource";

class CurrentOptionsDataSource {
  async getOptionsCandidates(
    ticker: string,
    underlyingPrice: number
  ): Promise<RawOptionsCandidate[]> {
    const provider = getConfiguredOptionsDataProvider();

    if (provider === "tradier") {
      return tradierOptionsDataSource.getOptionsCandidates(
        ticker,
        underlyingPrice
      );
    }

    return mockOptionsDataSource.getOptionsCandidates(ticker);
  }

  async getOptionsChainForExpiration(
    ticker: string,
    expiration: string
  ): Promise<RawOptionContractRow[]> {
    const provider = getConfiguredOptionsDataProvider();

    if (provider === "tradier") {
      return tradierOptionsDataSource.getOptionsChainForExpiration(
        ticker,
        expiration
      );
    }

    return mockOptionsDataSource.getOptionsChainForExpiration(ticker, expiration);
  }
}

export const currentOptionsDataSource = new CurrentOptionsDataSource();