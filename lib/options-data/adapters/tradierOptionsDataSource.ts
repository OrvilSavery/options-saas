import type { RawOptionsCandidate } from "@/lib/market-data/types";
import { getTradierApiToken, getTradierBaseUrl } from "@/lib/options-data/config";
import {
  OptionsDataConfigError,
  OptionsDataRequestError,
  OptionsDataResponseError,
  OptionsDataUnavailableError,
} from "@/lib/options-data/errors";
import { normalizeTradierOptionsChain } from "@/lib/options-data/normalizers/normalizeTradierOptionsChain";
import {
  assertArray,
  assertNonEmptyArray,
} from "@/lib/options-data/normalizers/guards";
import type {
  OptionsCandidateSource,
  RawOptionContractRow,
  TradierExpirationResponse,
  TradierOptionsChainResponse,
} from "@/lib/options-data/types";
import { generatePutCreditSpreadCandidates } from "@/lib/analyzer/candidates/generatePutCreditSpreadCandidates";
import { generateCallCreditSpreadCandidates } from "@/lib/analyzer/candidates/generateCallCreditSpreadCandidates";

function assertTradierExpirationsPayload(
  ticker: string,
  payload: unknown
): asserts payload is TradierExpirationResponse {
  if (typeof payload !== "object" || payload === null || !("expirations" in payload)) {
    throw new OptionsDataResponseError(
      `Tradier expirations response was malformed for ${ticker}.`
    );
  }
}

function extractExpirationList(payload: TradierExpirationResponse): string[] {
  const raw = payload.expirations?.date;

  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter(
      (value): value is string => typeof value === "string" && value.trim() !== ""
    );
  }

  if (typeof raw === "string" && raw.trim() !== "") {
    return [raw];
  }

  return [];
}

async function fetchTradierChain(
  ticker: string,
  expiration: string,
  token: string,
  baseUrl: string
): Promise<RawOptionContractRow[]> {
  let chainResponse: Response;
  try {
    chainResponse = await fetch(
      `${baseUrl}/markets/options/chains?symbol=${encodeURIComponent(
        ticker
      )}&expiration=${encodeURIComponent(expiration)}&greeks=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
  } catch {
    throw new OptionsDataRequestError(
      `Live options chain request failed for ${ticker} at ${expiration}.`
    );
  }

  if (!chainResponse.ok) {
    throw new OptionsDataRequestError(
      `Live options chain request failed for ${ticker} at ${expiration}.`
    );
  }

  let chainPayload: unknown;
  try {
    chainPayload = (await chainResponse.json()) as TradierOptionsChainResponse;
  } catch {
    throw new OptionsDataResponseError(
      `Live options chain response could not be parsed for ${ticker} at ${expiration}.`
    );
  }

  const normalizedRows = normalizeTradierOptionsChain(
    ticker,
    chainPayload as TradierOptionsChainResponse
  );

  assertArray(normalizedRows, `normalized live option rows for ${ticker}`);

  return normalizedRows.filter((row) => row.expiration === expiration);
}

class TradierOptionsDataSource implements OptionsCandidateSource {
  async getOptionsChainForExpiration(
    ticker: string,
    expiration: string
  ): Promise<RawOptionContractRow[]> {
    const normalizedTicker = ticker.trim().toUpperCase();

    let token: string;
    let baseUrl: string;

    try {
      token = getTradierApiToken();
      baseUrl = getTradierBaseUrl();
    } catch {
      throw new OptionsDataConfigError(
        "Options data source is not configured. Add a Tradier API token to use live options mode."
      );
    }

    const rows = await fetchTradierChain(
      normalizedTicker,
      expiration,
      token,
      baseUrl
    );

    if (rows.length === 0) {
      throw new OptionsDataUnavailableError(
        `No live option rows were available for ${normalizedTicker} at ${expiration}.`
      );
    }

    return rows;
  }

  async getOptionsCandidates(
    ticker: string,
    underlyingPrice: number
  ): Promise<RawOptionsCandidate[]> {
    const normalizedTicker = ticker.trim().toUpperCase();

    let token: string;
    let baseUrl: string;

    try {
      token = getTradierApiToken();
      baseUrl = getTradierBaseUrl();
    } catch {
      throw new OptionsDataConfigError(
        "Options data source is not configured. Add a Tradier API token to use live options mode."
      );
    }

    let expirationsResponse: Response;
    try {
      expirationsResponse = await fetch(
        `${baseUrl}/markets/options/expirations?symbol=${encodeURIComponent(normalizedTicker)}&includeAllRoots=true&strikes=false`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );
    } catch {
      throw new OptionsDataRequestError(
        `Live options expirations request failed for ${normalizedTicker}.`
      );
    }

    if (!expirationsResponse.ok) {
      if (expirationsResponse.status === 401 || expirationsResponse.status === 403) {
        throw new OptionsDataConfigError(
          "Live options authorization failed. Check your Tradier API token and environment."
        );
      }

      if (expirationsResponse.status === 429) {
        throw new OptionsDataRequestError(
          `Live options data is temporarily unavailable for ${normalizedTicker} due to rate limits.`
        );
      }

      throw new OptionsDataRequestError(
        `Live options expirations request failed for ${normalizedTicker}.`
      );
    }

    let expirationsPayload: unknown;
    try {
      expirationsPayload = await expirationsResponse.json();
    } catch {
      throw new OptionsDataResponseError(
        `Live options expirations response could not be parsed for ${normalizedTicker}.`
      );
    }

    assertTradierExpirationsPayload(normalizedTicker, expirationsPayload);

    const expirations = extractExpirationList(expirationsPayload);
    assertNonEmptyArray(expirations, `Tradier expirations for ${normalizedTicker}`);

    const allCandidates: RawOptionsCandidate[] = [];
    const chainErrors: string[] = [];

    for (const expiration of expirations) {
      try {
        const rowsForExpiration = await fetchTradierChain(
          normalizedTicker,
          expiration,
          token,
          baseUrl
        );

        if (rowsForExpiration.length === 0) {
          continue;
        }

        const putCandidates = generatePutCreditSpreadCandidates(
          normalizedTicker,
          underlyingPrice,
          rowsForExpiration
        );

        const callCandidates = generateCallCreditSpreadCandidates(
          normalizedTicker,
          underlyingPrice,
          rowsForExpiration
        );

        allCandidates.push(...putCandidates, ...callCandidates);
      } catch (error) {
        if (error instanceof Error) {
          chainErrors.push(error.message);
        } else {
          chainErrors.push(
            `Live options candidate generation failed for ${normalizedTicker} at ${expiration}.`
          );
        }
      }
    }

    if (allCandidates.length === 0) {
      if (chainErrors.length > 0) {
        throw new OptionsDataUnavailableError(chainErrors[0]);
      }

      throw new OptionsDataUnavailableError(
        `No valid live spread candidates were generated for ${normalizedTicker}.`
      );
    }

    return allCandidates;
  }
}

export const tradierOptionsDataSource = new TradierOptionsDataSource();