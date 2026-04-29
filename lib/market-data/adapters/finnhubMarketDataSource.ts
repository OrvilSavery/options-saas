import { getFinnhubApiKey } from "@/lib/market-data/config";
import {
  MarketDataConfigError,
  MarketDataRequestError,
  MarketDataResponseError,
} from "@/lib/market-data/errors";
import { normalizeFinnhubQuoteToUnderlyingSnapshot } from "@/lib/market-data/normalizers/normalizeFinnhubQuoteToUnderlyingSnapshot";
import type { MarketDataSource, RawUnderlyingSnapshot } from "@/lib/market-data/types";

interface FinnhubQuoteResponse {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

function assertFinnhubQuoteShape(
  ticker: string,
  quote: unknown
): asserts quote is FinnhubQuoteResponse {
  if (
    typeof quote !== "object" ||
    quote === null ||
    !("c" in quote) ||
    !("h" in quote) ||
    !("l" in quote) ||
    !("o" in quote) ||
    !("pc" in quote)
  ) {
    throw new MarketDataResponseError(
      `Finnhub quote response was malformed for ${ticker}.`
    );
  }

  const candidate = quote as Record<string, unknown>;

  if (
    typeof candidate.c !== "number" ||
    typeof candidate.h !== "number" ||
    typeof candidate.l !== "number" ||
    typeof candidate.o !== "number" ||
    typeof candidate.pc !== "number"
  ) {
    throw new MarketDataResponseError(
      `Finnhub quote response was malformed for ${ticker}.`
    );
  }
}

class FinnhubMarketDataSource implements MarketDataSource {
  async getUnderlyingSnapshot(ticker: string): Promise<RawUnderlyingSnapshot> {
    const normalizedTicker = ticker.trim().toUpperCase();

    let apiKey: string;
    try {
      apiKey = getFinnhubApiKey();
    } catch {
      throw new MarketDataConfigError(
        "Market data source is not configured. Add a Finnhub API key to use live quote mode."
      );
    }

    let response: Response;
    try {
      response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(normalizedTicker)}`,
        {
          method: "GET",
          headers: {
            "X-Finnhub-Token": apiKey,
          },
          cache: "no-store",
        }
      );
    } catch {
      throw new MarketDataRequestError(
        `Live quote request failed for ${normalizedTicker}.`
      );
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new MarketDataConfigError(
          "Live market data authorization failed. Check your Finnhub API key."
        );
      }

      if (response.status === 429) {
        throw new MarketDataRequestError(
          `Live quote data is temporarily unavailable for ${normalizedTicker} due to rate limits.`
        );
      }

      throw new MarketDataRequestError(
        `Live quote request failed for ${normalizedTicker}.`
      );
    }

    let quote: unknown;
    try {
      quote = await response.json();
    } catch {
      throw new MarketDataResponseError(
        `Live quote response could not be parsed for ${normalizedTicker}.`
      );
    }

    assertFinnhubQuoteShape(normalizedTicker, quote);

    return normalizeFinnhubQuoteToUnderlyingSnapshot(normalizedTicker, quote);
  }
}

export const finnhubMarketDataSource = new FinnhubMarketDataSource();