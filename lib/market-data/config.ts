export type ConfiguredMarketDataProvider = "mock" | "finnhub";

export function getConfiguredMarketDataProvider(): ConfiguredMarketDataProvider {
  const value = (process.env.MARKET_DATA_PROVIDER ?? "mock").trim().toLowerCase();

  if (value === "finnhub") {
    return "finnhub";
  }

  return "mock";
}

export function getFinnhubApiKey(): string {
  const apiKey = process.env.FINNHUB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "FINNHUB_API_KEY is required when MARKET_DATA_PROVIDER=finnhub"
    );
  }

  return apiKey;
}