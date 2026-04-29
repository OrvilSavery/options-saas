import type {
  Alternative,
  BestStrategy,
  ComparedSetup,
  ExecutionLabel,
  TradeQualityBand,
} from "@/types/analysis";
import type {
  AnalyzerInput,
  AnalyzerStrategyCandidate,
} from "@/lib/analyzer/input/types";
import { applyCandidateHardGates } from "@/lib/analyzer/gates/applyCandidateHardGates";
import { scoreTradeQuality } from "@/lib/analyzer/scoring/scoreTradeQuality";
import {
  isCreditSpread,
  scoreSetup as scoreCreditSpreadSetup,
} from "@/lib/analyzer/scoring/credit-spread";
import { buildEngineParams } from "@/lib/analyzer/scoring/credit-spread/buildEngineParams";

interface RankedCandidate {
  candidate: AnalyzerStrategyCandidate;
  quality: {
    totalScore: number;
    band: TradeQualityBand;
  };
  engineResult: {
    total: number;
    verdict?: {
      band?: string;
      label?: string;
    };
  } | null;
}

export interface RequestedSetupSelection {
  strategy: string;
  expiration: string;
  shortStrike: number;
  longStrike: number;
}

interface RankedStrategies {
  bestStrategy: BestStrategy | null;
  bestCandidate: AnalyzerStrategyCandidate | null;
  currentComparedSetup: ComparedSetup | null;
  saferAlternative: Alternative | null;
  aggressiveAlternative: Alternative | null;
  comparedSetups: ComparedSetup[];
  survivingCandidates: AnalyzerStrategyCandidate[];
  bestCandidateScore: number | null;
  bestCandidateBand: TradeQualityBand | null;
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

function sumNullable(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}

function hasSolidExecution(candidate: AnalyzerStrategyCandidate): boolean {
  const avgWidth = averageWidth(
    candidate.shortLegBidAskWidth,
    candidate.longLegBidAskWidth
  );

  const shortOi = candidate.shortLegOpenInterest ?? 0;
  const longOi = candidate.longLegOpenInterest ?? 0;
  const shortVolume = candidate.shortLegVolume ?? 0;

  return (
    avgWidth != null &&
    avgWidth <= 0.1 &&
    shortOi >= 100 &&
    longOi >= 50 &&
    shortVolume >= 25
  );
}

function deriveExecutionLabel(
  candidate: AnalyzerStrategyCandidate
): ExecutionLabel | null {
  const avgWidth = averageWidth(
    candidate.shortLegBidAskWidth,
    candidate.longLegBidAskWidth
  );

  const shortOi = candidate.shortLegOpenInterest ?? 0;
  const longOi = candidate.longLegOpenInterest ?? 0;
  const shortVolume = candidate.shortLegVolume ?? 0;
  const longVolume = candidate.longLegVolume ?? 0;

  if (
    avgWidth != null &&
    avgWidth <= 0.1 &&
    shortOi >= 100 &&
    longOi >= 50 &&
    shortVolume >= 25
  ) {
    return "Clean";
  }

  if (
    avgWidth != null &&
    avgWidth <= 0.15 &&
    shortOi >= 75 &&
    longOi >= 25 &&
    (shortVolume >= 10 || longVolume >= 10)
  ) {
    return "Usable";
  }

  if (avgWidth != null && avgWidth <= 0.2 && shortOi >= 50) {
    return "Tight";
  }

  return "Limited";
}

function roomFromShortStrike(
  candidate: AnalyzerStrategyCandidate,
  underlyingPrice: number
): number {
  if (candidate.directionalBias === "bearish") {
    return (candidate.shortStrike - underlyingPrice) / underlyingPrice;
  }

  return (underlyingPrice - candidate.shortStrike) / underlyingPrice;
}

function buildRoomPhrase(candidate: AnalyzerStrategyCandidate): string {
  return candidate.directionalBias === "bearish"
    ? "usable room above the short strike"
    : "usable downside room";
}

function buildWhyTopRanked(
  candidate: AnalyzerStrategyCandidate,
  totalScore: number,
  band: string
): string {
  const strengths: string[] = [];

  if (candidate.downsideBufferScore >= 6) strengths.push(buildRoomPhrase(candidate));
  if ((candidate.returnOnRisk ?? 0) >= 0.18) strengths.push("reasonable return for the defined risk");
  if (candidate.daysToExpiration >= 21 && candidate.daysToExpiration <= 45) strengths.push("a healthier premium-selling time window");
  if (candidate.width <= 5) strengths.push("manageable defined-risk width");
  if (hasSolidExecution(candidate)) strengths.push("cleaner execution conditions");

  const summary =
    strengths.length > 0
      ? strengths.join(", ")
      : "balanced tradeoffs across quality, structure, and risk";

  return `This setup was chosen for review because it offers ${summary}.`;
}

function buildAlternativeNote(
  type: "safer" | "aggressive",
  candidate: AnalyzerStrategyCandidate
): string {
  const roomPhrase =
    candidate.directionalBias === "bearish"
      ? "More room above the short strike"
      : "More downside room";

  return type === "safer"
    ? `${roomPhrase}, but typically less premium.`
    : "More premium, but less room and a tighter margin for error.";
}

function buildCurrentNote(
  candidate: AnalyzerStrategyCandidate,
  band: TradeQualityBand,
  source: "survivor" | "fallback" = "survivor"
): string {
  const roomPhrase =
    candidate.directionalBias === "bearish"
      ? "room above the short strike"
      : "downside room";

  if (source === "fallback") {
    return "No clean setup cleared the review rules. This setup is shown only as context.";
  }

  return `This setup has ${roomPhrase} and is available for review.`;
}

function mapEngineBandToTradeQualityBand(
  band: string | null | undefined
): TradeQualityBand {
  switch (band) {
    case "high_conviction":
    case "good_setup":
      return "Strong";
    case "watchlist":
      return "Selective";
    case "weak":
      return "Weak";
    case "pass":
    case "disqualified":
    default:
      return "Weak";
  }
}

function buildComparedSetup(
  role: ComparedSetup["role"],
  candidate: AnalyzerStrategyCandidate,
  quality: RankedCandidate["quality"] | null,
  underlyingPrice: number,
  note: string
): ComparedSetup {
  return {
    role,
    strategy: candidate.strategy,
    expiration: candidate.expiration,
    setupLabel: candidate.setupLabel,
    premium: candidate.premium,
    returnOnRisk: candidate.returnOnRisk,
    tradeQualityScore: quality?.totalScore ?? null,
    tradeQualityBand: quality?.band ?? null,
    shortStrike: candidate.shortStrike,
    longStrike: candidate.longStrike,
    width: candidate.width,
    daysToExpiration: candidate.daysToExpiration,
    downsideRoom: Number(roomFromShortStrike(candidate, underlyingPrice).toFixed(4)),
    expectedMoveLow: candidate.expectedMoveLow ?? null,
    expectedMoveHigh: candidate.expectedMoveHigh ?? null,
    executionLabel: deriveExecutionLabel(candidate),
    bidAskWidth: averageWidth(
      candidate.shortLegBidAskWidth,
      candidate.longLegBidAskWidth
    ),
    volume: sumNullable(candidate.shortLegVolume, candidate.longLegVolume),
    openInterest: sumNullable(
      candidate.shortLegOpenInterest,
      candidate.longLegOpenInterest
    ),
    note,
  };
}

function buildComparedSetupKey(setup: ComparedSetup): string {
  return [
    setup.strategy,
    setup.expiration,
    setup.shortStrike,
    setup.longStrike,
    setup.role,
  ].join("::");
}

function dedupeComparedSetups(setups: Array<ComparedSetup | null>): ComparedSetup[] {
  const seen = new Set<string>();
  const results: ComparedSetup[] = [];

  for (const setup of setups) {
    if (!setup) continue;
    const key = buildComparedSetupKey(setup);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(setup);
  }

  return results;
}

function matchesRequestedSetup(
  candidate: AnalyzerStrategyCandidate,
  requestedSetup: RequestedSetupSelection | null | undefined
) {
  if (!requestedSetup) return false;

  return (
    candidate.strategy === requestedSetup.strategy &&
    candidate.expiration === requestedSetup.expiration &&
    candidate.shortStrike === requestedSetup.shortStrike &&
    candidate.longStrike === requestedSetup.longStrike
  );
}

function scoreCandidate(
  input: AnalyzerInput,
  candidate: AnalyzerStrategyCandidate
): RankedCandidate {
  if (isCreditSpread(candidate)) {
    const engineParams = buildEngineParams(input, candidate);
    if (engineParams) {
      const engineResult = scoreCreditSpreadSetup(engineParams);
      return {
        candidate,
        quality: {
          totalScore: Math.round(engineResult.total),
          band: mapEngineBandToTradeQualityBand(engineResult.verdict?.band),
        },
        engineResult,
      };
    }
  }

  const legacyQuality = scoreTradeQuality(input, candidate);
  return {
    candidate,
    quality: legacyQuality,
    engineResult: null,
  };
}

function sameSpread(candidate: AnalyzerStrategyCandidate, other: AnalyzerStrategyCandidate) {
  return (
    candidate.strategy === other.strategy &&
    candidate.expiration === other.expiration &&
    candidate.shortStrike === other.shortStrike &&
    candidate.longStrike === other.longStrike
  );
}

function sameExpirationAndWidth(
  candidate: AnalyzerStrategyCandidate,
  top: AnalyzerStrategyCandidate
) {
  return (
    candidate.strategy === top.strategy &&
    candidate.directionalBias === top.directionalBias &&
    candidate.expiration === top.expiration &&
    candidate.width === top.width
  );
}


function buildReviewComparisonCandidates(
  input: AnalyzerInput,
  requestedCandidate: AnalyzerStrategyCandidate
): AnalyzerStrategyCandidate[] {
  const sameExpirationWidth = input.candidateStrategies.filter(
    (candidate) =>
      candidate.strategy === requestedCandidate.strategy &&
      candidate.directionalBias === requestedCandidate.directionalBias &&
      candidate.expiration === requestedCandidate.expiration &&
      candidate.width === requestedCandidate.width
  );

  const exactKey = [
    requestedCandidate.strategy,
    requestedCandidate.expiration,
    requestedCandidate.shortStrike,
    requestedCandidate.longStrike,
  ].join("::");

  const deduped: AnalyzerStrategyCandidate[] = [];
  const seen = new Set<string>();

  for (const candidate of [requestedCandidate, ...sameExpirationWidth]) {
    const key = [
      candidate.strategy,
      candidate.expiration,
      candidate.shortStrike,
      candidate.longStrike,
    ].join("::");
    if (seen.has(key)) continue;
    seen.add(key);

    // Keep the exact reviewed setup first even if it appears elsewhere in the pool.
    if (key === exactKey && deduped.length > 0) {
      deduped.unshift(candidate);
    } else {
      deduped.push(candidate);
    }
  }

  return deduped;
}

function getCredit(candidate: AnalyzerStrategyCandidate) {
  return candidate.netCredit ?? candidate.premium ?? 0;
}

function pickMoreRoomEntry(
  pool: RankedCandidate[],
  top: RankedCandidate,
  underlyingPrice: number
): RankedCandidate | null {
  const topRoom = roomFromShortStrike(top.candidate, underlyingPrice);

  return (
    pool
      .filter(
        (entry) =>
          roomFromShortStrike(entry.candidate, underlyingPrice) > topRoom
      )
      .sort((a, b) => {
        const roomDelta =
          roomFromShortStrike(b.candidate, underlyingPrice) -
          roomFromShortStrike(a.candidate, underlyingPrice);
        if (Math.abs(roomDelta) > 0.001) return roomDelta;
        return getCredit(b.candidate) - getCredit(a.candidate);
      })[0] ?? null
  );
}

function pickMoreCreditEntry(
  pool: RankedCandidate[],
  top: RankedCandidate
): RankedCandidate | null {
  const topCredit = getCredit(top.candidate);

  return (
    pool
      .filter((entry) => getCredit(entry.candidate) > topCredit)
      .sort((a, b) => getCredit(b.candidate) - getCredit(a.candidate))[0] ??
    null
  );
}

function buildRankedResult(
  input: AnalyzerInput,
  scored: RankedCandidate[],
  requestedSetup: RequestedSetupSelection | null,
  source: "survivor" | "fallback"
): RankedStrategies {
  scored.sort((a, b) => {
    const scoreDelta = b.quality.totalScore - a.quality.totalScore;
    if (Math.abs(scoreDelta) > 3) return scoreDelta;

    const aDteDistance = Math.abs(a.candidate.daysToExpiration - 35);
    const bDteDistance = Math.abs(b.candidate.daysToExpiration - 35);
    return aDteDistance - bDteDistance;
  });

  const top =
    (requestedSetup
      ? scored.find(({ candidate }) => matchesRequestedSetup(candidate, requestedSetup))
      : null) ?? scored[0];

  const sameStrategyCandidates = scored.filter(
    ({ candidate }) =>
      candidate.strategy === top.candidate.strategy &&
      candidate.directionalBias === top.candidate.directionalBias
  );

  const alternativesPool = sameStrategyCandidates.filter(
    ({ candidate }) => !sameSpread(candidate, top.candidate)
  );

  const sameExpirationPool = alternativesPool.filter(({ candidate }) =>
    sameExpirationAndWidth(candidate, top.candidate)
  );

  const preferredPool =
    sameExpirationPool.length > 0 ? sameExpirationPool : alternativesPool;

  const saferEntry = pickMoreRoomEntry(
    preferredPool,
    top,
    input.underlyingPrice
  );

  const aggressiveEntry = pickMoreCreditEntry(
    preferredPool.filter((entry) =>
      saferEntry ? !sameSpread(entry.candidate, saferEntry.candidate) : true
    ),
    top
  );

  const currentComparedSetup = buildComparedSetup(
    "current",
    top.candidate,
    top.quality,
    input.underlyingPrice,
    buildCurrentNote(top.candidate, top.quality.band, source)
  );

  const saferAlternative =
    saferEntry
      ? buildComparedSetup(
          "safer",
          saferEntry.candidate,
          saferEntry.quality,
          input.underlyingPrice,
          buildAlternativeNote("safer", saferEntry.candidate)
        )
      : null;

  const aggressiveAlternative =
    aggressiveEntry
      ? buildComparedSetup(
          "higher_premium",
          aggressiveEntry.candidate,
          aggressiveEntry.quality,
          input.underlyingPrice,
          buildAlternativeNote("aggressive", aggressiveEntry.candidate)
        )
      : null;

  return {
    bestStrategy: {
      strategy: top.candidate.strategy,
      expiration: top.candidate.expiration,
      setupLabel: top.candidate.setupLabel,
      premium: top.candidate.premium,
      returnOnRisk: top.candidate.returnOnRisk,
      whyTopRanked: buildWhyTopRanked(
        top.candidate,
        top.quality.totalScore,
        top.quality.band
      ),
      tradeQualityScore: top.quality.totalScore,
      tradeQualityBand: top.quality.band,
    },
    bestCandidate: top.candidate,
    currentComparedSetup,
    saferAlternative,
    aggressiveAlternative,
    comparedSetups: dedupeComparedSetups([
      currentComparedSetup,
      saferAlternative,
      aggressiveAlternative,
    ]),
    survivingCandidates: source === "survivor" ? scored.map((entry) => entry.candidate) : [],
    bestCandidateScore: top.quality.totalScore,
    bestCandidateBand: top.quality.band,
  };
}

export function rankStrategies(
  input: AnalyzerInput,
  requestedSetup: RequestedSetupSelection | null = null
): RankedStrategies {
  const requestedCandidate =
    requestedSetup == null
      ? null
      : input.candidateStrategies.find((candidate) =>
          matchesRequestedSetup(candidate, requestedSetup)
        ) ?? null;

  const survivingCandidates = input.candidateStrategies.filter((candidate) => {
    if (
      requestedCandidate &&
      candidate.strategy === requestedCandidate.strategy &&
      candidate.expiration === requestedCandidate.expiration &&
      candidate.shortStrike === requestedCandidate.shortStrike &&
      candidate.longStrike === requestedCandidate.longStrike
    ) {
      return true;
    }

    return applyCandidateHardGates(candidate, input.underlyingPrice);
  });

  if (requestedCandidate) {
    const reviewComparisonCandidates = buildReviewComparisonCandidates(
      input,
      requestedCandidate
    );

    if (reviewComparisonCandidates.length > 0) {
      const result = buildRankedResult(
        input,
        reviewComparisonCandidates.map((candidate) => scoreCandidate(input, candidate)),
        requestedSetup,
        "survivor"
      );

      return {
        ...result,
        // Keep the decision-facing surviving list honest while still letting Review
        // mode compare nearby same-expiration setups in the UI.
        survivingCandidates,
      };
    }
  }

  if (survivingCandidates.length > 0) {
    return buildRankedResult(
      input,
      survivingCandidates.map((candidate) => scoreCandidate(input, candidate)),
      requestedSetup,
      "survivor"
    );
  }

  return {
    bestStrategy: null,
    bestCandidate: null,
    currentComparedSetup: null,
    saferAlternative: null,
    aggressiveAlternative: null,
    comparedSetups: [],
    survivingCandidates: [],
    bestCandidateScore: null,
    bestCandidateBand: null,
  };
}
