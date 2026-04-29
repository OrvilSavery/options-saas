import type { BestStrategy } from "@/types/analysis";
import type { AnalyzerInput } from "@/lib/analyzer/input/types";
import { assessEventRisk } from "@/lib/analyzer/rules/assessEventRisk";

interface DeriveRisksInput {
  input: AnalyzerInput;
  bestStrategy: BestStrategy | null;
  candidateCount: number;
  isExactReview?: boolean;
}

function findBestCandidate(
  input: AnalyzerInput,
  bestStrategy: BestStrategy | null
) {
  if (!bestStrategy) return null;

  return (
    input.candidateStrategies.find(
      (candidate) => candidate.setupLabel === bestStrategy.setupLabel
    ) ?? null
  );
}

function averageWidth(
  shortWidth: number | null,
  longWidth: number | null
): number | null {
  if (shortWidth == null && longWidth == null) return null;
  if (shortWidth == null) return longWidth;
  if (longWidth == null) return shortWidth;
  return Number(((shortWidth + longWidth) / 2).toFixed(2));
}

function hasWeakExecution(
  candidate: NonNullable<ReturnType<typeof findBestCandidate>>
) {
  const avgWidth = averageWidth(
    candidate.shortLegBidAskWidth,
    candidate.longLegBidAskWidth
  );

  const shortOi = candidate.shortLegOpenInterest ?? 0;
  const longOi = candidate.longLegOpenInterest ?? 0;
  const shortVolume = candidate.shortLegVolume ?? 0;
  const longVolume = candidate.longLegVolume ?? 0;

  const wideSpreads = avgWidth == null || avgWidth > 0.15;
  const weakOpenInterest = shortOi < 100 || longOi < 50;
  const weakVolume = shortVolume < 25 && longVolume < 10;

  return {
    wideSpreads,
    weakOpenInterest,
    weakVolume,
  };
}

function buildRoomRisk(
  candidate: NonNullable<ReturnType<typeof findBestCandidate>>
): string {
  if (candidate.directionalBias === "bearish") {
    return "The short strike does not leave much room above it if price pushes higher.";
  }

  return "The short strike does not leave much downside room if price weakens.";
}

export function deriveRisks({
  input,
  bestStrategy,
  candidateCount,
  isExactReview = false,
}: DeriveRisksInput): string[] {
  const bestCandidate = findBestCandidate(input, bestStrategy);

  if (!bestCandidate) {
    return ["No setups cleared the current review rules."];
  }

  const risks: string[] = [];
  const executionFlags = hasWeakExecution(bestCandidate);
  const eventRisk = assessEventRisk(input);

  if (bestCandidate.downsideBufferScore <= 5) {
    risks.push(buildRoomRisk(bestCandidate));
  }

  if ((bestCandidate.returnOnRisk ?? 0) < 0.18) {
    risks.push(
      "Premium is not especially strong relative to the defined risk in the spread."
    );
  }

  if (eventRisk === "high") {
    risks.push(
      "Near-term catalyst pressure looks elevated, so otherwise acceptable premium can still get overwhelmed by a sharp move."
    );
  } else if (eventRisk === "medium") {
    risks.push(
      "Some catalyst pressure may be present in the current backdrop, so timing and selectivity matter more here."
    );
  }

  if (bestCandidate.daysToExpiration <= 9) {
    risks.push(
      "The setup has a short time window, so price movement matters more quickly."
    );
  }

  if (
    executionFlags.wideSpreads ||
    executionFlags.weakOpenInterest ||
    executionFlags.weakVolume
  ) {
    risks.push(
      "Execution quality looks less reliable here, which can make entries and exits less efficient than the setup appears on paper."
    );
  }

  if (input.volatilityContext.impliedVolatilityLabel === "high") {
    risks.push(
      "The current volatility backdrop can make the spread harder to hold through sudden moves."
    );
  }

  if (!isExactReview && candidateCount <= 2) {
    risks.push(
      "Only a limited number of viable candidates were available, which lowers setup flexibility."
    );
  }

  if (bestCandidate.width >= 5) {
    risks.push(
      "The spread width increases the defined-risk amount even if the setup remains valid."
    );
  }

  return risks.slice(0, 3);
}
