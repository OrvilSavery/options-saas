import type { RawOptionsCandidate } from "@/lib/market-data/types";
import type { SeededAnalyzerInput } from "@/lib/analyzer/input/seeded/types";
import { currentMarketDataSource } from "@/lib/market-data/adapters";
import { deriveMarketSummary } from "@/lib/market-data/normalizers/deriveMarketSummary";
import { deriveVolatilitySummary } from "@/lib/market-data/normalizers/deriveVolatilitySummary";
import { currentOptionsDataSource } from "@/lib/options-data/adapters";
import {
  OptionsDataConfigError,
  OptionsDataRequestError,
  OptionsDataResponseError,
  OptionsDataUnavailableError,
} from "@/lib/options-data/errors";

function toOptionsSourceMessage(error: unknown): string {
  if (error instanceof OptionsDataConfigError) return error.message;
  if (error instanceof OptionsDataRequestError) return error.message;
  if (error instanceof OptionsDataResponseError) return "The live options response could not be validated.";
  if (error instanceof OptionsDataUnavailableError) return error.message;
  if (error instanceof Error) return `Failed to build live options candidates: ${error.message}`;
  return "Failed to build live options candidates.";
}

function enrichCandidateWithSnapshotContext(
  candidate: RawOptionsCandidate,
  snapshot: {
    ivRank?: number | null;
    ivHvRatio?: number | null;
    expectedMoveLow?: number | null;
    expectedMoveHigh?: number | null;
  }
): RawOptionsCandidate {
  return {
    ...candidate,
    ivRank: candidate.ivRank ?? snapshot.ivRank ?? null,
    ivHvRatio: candidate.ivHvRatio ?? snapshot.ivHvRatio ?? null,
    expectedMoveLow: candidate.expectedMoveLow ?? snapshot.expectedMoveLow ?? null,
    expectedMoveHigh: candidate.expectedMoveHigh ?? snapshot.expectedMoveHigh ?? null,
  };
}

export async function getSeededAnalyzerInput(
  ticker: string
): Promise<SeededAnalyzerInput> {
  const underlyingSnapshot = await currentMarketDataSource.getUnderlyingSnapshot(ticker);

  let rawCandidates: RawOptionsCandidate[];
  try {
    rawCandidates = await currentOptionsDataSource.getOptionsCandidates(
      ticker,
      underlyingSnapshot.price
    );
  } catch (error) {
    throw new Error(toOptionsSourceMessage(error));
  }

  const candidateStrategies = rawCandidates.map((candidate) =>
    enrichCandidateWithSnapshotContext(candidate, underlyingSnapshot)
  );

  return {
    ticker: underlyingSnapshot.ticker,
    underlyingPrice: underlyingSnapshot.price,

    marketContext: {
      summary: deriveMarketSummary(
        underlyingSnapshot.trendLabel,
        underlyingSnapshot.structureSummary
      ),
    },

    volatilityContext: {
      summary: deriveVolatilitySummary(
        underlyingSnapshot.impliedVolatilityLabel,
        underlyingSnapshot.premiumEnvironmentSummary
      ),
      impliedVolatilityLabel: underlyingSnapshot.impliedVolatilityLabel,
    },

    expectedMoveContext: {
      expectedMoveLow: underlyingSnapshot.expectedMoveLow ?? null,
      expectedMoveHigh: underlyingSnapshot.expectedMoveHigh ?? null,
    },

    eventContext: {
      risk: underlyingSnapshot.eventRisk,
      nextEarningsDate: underlyingSnapshot.nextEarningsDate ?? null,
      eventSourceQuality: underlyingSnapshot.eventSourceQuality ?? "unknown",
    },

    decisionContext: {
      decision: underlyingSnapshot.decision,
      risks: underlyingSnapshot.risks,
    },

    candidateStrategies,
  };
}
