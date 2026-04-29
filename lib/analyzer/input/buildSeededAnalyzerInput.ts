import type { AnalyzerInput } from "@/lib/analyzer/input/types";
import { getSeededAnalyzerInput } from "@/lib/analyzer/input/seeded/getSeededAnalyzerInput";
import { normalizeAnalyzerInput } from "@/lib/analyzer/input/normalizers/normalizeAnalyzerInput";
import {
  MarketDataConfigError,
  MarketDataRequestError,
  MarketDataResponseError,
  MarketDataUnavailableError,
} from "@/lib/market-data/errors";

function toAnalyzerInputMessage(error: unknown): string {
  if (error instanceof MarketDataConfigError) {
    return error.message;
  }

  if (error instanceof MarketDataRequestError) {
    return error.message;
  }

  if (error instanceof MarketDataResponseError) {
    return "The live quote response could not be validated.";
  }

  if (error instanceof MarketDataUnavailableError) {
    return error.message;
  }

  if (error instanceof Error) {
    return `Failed to build seeded analyzer input: ${error.message}`;
  }

  return "Failed to build seeded analyzer input.";
}

export async function buildSeededAnalyzerInput(
  ticker: string
): Promise<AnalyzerInput> {
  try {
    const seededInput = await getSeededAnalyzerInput(ticker);
    return normalizeAnalyzerInput(seededInput);
  } catch (error) {
    throw new Error(toAnalyzerInputMessage(error));
  }
}