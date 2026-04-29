import type { AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";
import type {
  ExecutionEvidence,
  ExecutionLabel,
  SetupEvidence,
} from "@/types/analysis";

function averageValue(
  first: number | null,
  second: number | null
): number | null {
  if (first == null && second == null) {
    return null;
  }

  if (first == null) {
    return second;
  }

  if (second == null) {
    return first;
  }

  return Number(((first + second) / 2).toFixed(2));
}

function sumValue(
  first: number | null,
  second: number | null
): number | null {
  if (first == null && second == null) {
    return null;
  }

  return (first ?? 0) + (second ?? 0);
}

function deriveDownsideRoom(
  candidate: AnalyzerStrategyCandidate,
  underlyingPrice: number
): number | null {
  if (!Number.isFinite(underlyingPrice) || underlyingPrice <= 0) {
    return null;
  }

  if (candidate.directionalBias === "bearish") {
    return (candidate.shortStrike - underlyingPrice) / underlyingPrice;
  }

  return (underlyingPrice - candidate.shortStrike) / underlyingPrice;
}

function deriveExecutionLabel({
  bidAskWidth,
  volume,
  openInterest,
}: {
  bidAskWidth: number | null;
  volume: number | null;
  openInterest: number | null;
}): ExecutionLabel | null {
  if (bidAskWidth == null && volume == null && openInterest == null) {
    return null;
  }

  if (
    bidAskWidth != null &&
    bidAskWidth <= 0.1 &&
    (volume ?? 0) >= 50 &&
    (openInterest ?? 0) >= 300
  ) {
    return "Clean";
  }

  if (
    bidAskWidth != null &&
    bidAskWidth <= 0.2 &&
    (volume ?? 0) >= 20 &&
    (openInterest ?? 0) >= 100
  ) {
    return "Usable";
  }

  if (
    bidAskWidth != null &&
    bidAskWidth <= 0.35 &&
    (openInterest ?? 0) >= 50
  ) {
    return "Tight";
  }

  return "Limited";
}

function buildExecutionSummary({
  executionLabel,
  bidAskWidth,
  volume,
  openInterest,
}: {
  executionLabel: ExecutionLabel | null;
  bidAskWidth: number | null;
  volume: number | null;
  openInterest: number | null;
}): string | null {
  if (!executionLabel) {
    return null;
  }

  if (executionLabel === "Clean") {
    return "Bid/ask width looks relatively tight and the setup shows enough activity to support cleaner fills.";
  }

  if (executionLabel === "Usable") {
    return "Execution looks workable, but the fill may still require some price discipline depending on market conditions.";
  }

  if (executionLabel === "Tight") {
    return "Execution looks tradable, but liquidity appears thinner and the spread may take more patience to fill cleanly.";
  }

  if (bidAskWidth == null && volume == null && openInterest == null) {
    return "Execution context is limited because live liquidity detail is not fully available.";
  }

  return "Execution looks more limited here, so the setup may be harder to enter or exit cleanly without giving up price.";
}

function buildSetupSummary({
  candidate,
  downsideRoom,
}: {
  candidate: AnalyzerStrategyCandidate;
  downsideRoom: number | null;
}): string {
  const downsideText =
    downsideRoom == null
      ? "Downside room is harder to quantify from the current data."
      : candidate.directionalBias === "bearish"
        ? `The short strike sits ${Math.abs(downsideRoom * 100).toFixed(1)}% above spot, which frames how much upside room the call spread has before pressure builds.`
        : `The short strike sits ${(downsideRoom * 100).toFixed(1)}% below spot, which frames how much downside room the put spread has before pressure builds.`;

  return `${candidate.width}-wide structure with ${candidate.daysToExpiration} DTE. ${downsideText}`;
}

export function buildStrategyEvidence(
  candidate: AnalyzerStrategyCandidate | null,
  underlyingPrice: number
): {
  setupContext: SetupEvidence | null;
  executionContext: ExecutionEvidence | null;
} {
  if (!candidate) {
    return {
      setupContext: null,
      executionContext: null,
    };
  }

  const downsideRoom = deriveDownsideRoom(candidate, underlyingPrice);

  const bidAskWidth = averageValue(
    candidate.shortLegBidAskWidth,
    candidate.longLegBidAskWidth
  );

  const volume = sumValue(candidate.shortLegVolume, candidate.longLegVolume);

  const openInterest = sumValue(
    candidate.shortLegOpenInterest,
    candidate.longLegOpenInterest
  );

  const executionLabel = deriveExecutionLabel({
    bidAskWidth,
    volume,
    openInterest,
  });

  const executionSummary = buildExecutionSummary({
    executionLabel,
    bidAskWidth,
    volume,
    openInterest,
  });

  return {
    setupContext: {
      shortStrike: candidate.shortStrike,
      longStrike: candidate.longStrike,
      width: candidate.width,
      daysToExpiration: candidate.daysToExpiration,
      downsideRoom,
      setupSummary: buildSetupSummary({
        candidate,
        downsideRoom,
      }),
    },
    executionContext: {
      bidAskWidth,
      volume,
      openInterest,
      executionLabel,
      executionSummary,
    },
  };
}