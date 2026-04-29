import type { AnalysisResponse } from "@/types/analysis";
import type { AnalyzerEntryRequest, ReviewExactSetupRequest } from "@/lib/analyzer/entry/types";
import type { AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";
import { buildSeededAnalyzerInput } from "@/lib/analyzer/input/buildSeededAnalyzerInput";
import { assessEventRisk } from "@/lib/analyzer/rules/assessEventRisk";
import { assessMarketCondition } from "@/lib/analyzer/rules/assessMarketCondition";
import { assessVolatilityCondition } from "@/lib/analyzer/rules/assessVolatilityCondition";
import { rankStrategies } from "@/lib/analyzer/scoring/rankStrategies";
import { buildExplanation } from "@/lib/analyzer/formatters/buildExplanation";
import { buildAnalysisEvidence } from "@/lib/analyzer/formatters/buildAnalysisEvidence";
import { deriveDecision } from "@/lib/analyzer/decision/deriveDecision";
import { deriveRisks } from "@/lib/analyzer/decision/deriveRisks";
import { deriveEventRisks } from "@/lib/analyzer/events/deriveEventRisks";
import { buildAnalysisMetadata } from "@/lib/analyzer/metadata/buildAnalysisMetadata";
import { currentOptionsDataSource } from "@/lib/options-data/adapters/currentOptionsDataSource";
import { buildExactRequestedCreditSpread } from "@/lib/analyzer/exact-review/buildExactRequestedCreditSpread";

function buildCandidateKey(candidate: Pick<
  AnalyzerStrategyCandidate,
  "strategy" | "expiration" | "shortStrike" | "longStrike"
>) {
  return [
    candidate.strategy,
    candidate.expiration,
    candidate.shortStrike,
    candidate.longStrike,
  ].join("::");
}

function mergeCandidates(
  candidates: AnalyzerStrategyCandidate[],
  reviewCandidates: AnalyzerStrategyCandidate[]
): AnalyzerStrategyCandidate[] {
  const merged: AnalyzerStrategyCandidate[] = [];
  const seen = new Set<string>();

  for (const candidate of reviewCandidates) {
    const key = buildCandidateKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(candidate);
  }

  for (const candidate of candidates) {
    const key = buildCandidateKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(candidate);
  }

  return merged;
}


function scoreDistanceBuffer(
  strategyType: ReviewExactSetupRequest["strategyType"],
  underlyingPrice: number,
  shortStrike: number
): number {
  const distancePct =
    strategyType === "put_credit_spread"
      ? (underlyingPrice - shortStrike) / underlyingPrice
      : (shortStrike - underlyingPrice) / underlyingPrice;

  const scaled = Math.min(Math.max(distancePct, 0) / 0.12, 1);
  return Math.max(1, Math.min(10, Math.round(scaled * 10)));
}

function scorePremiumForCredit(returnOnRisk: number): number {
  const scaled = Math.min(Math.max(returnOnRisk, 0) / 0.35, 1);
  return Math.max(1, Math.min(10, Math.round(scaled * 10)));
}

function buildReviewFallbackCandidate({
  source,
  ticker,
  strategyType,
  underlyingPrice,
  shortStrike,
  longStrike,
  creditMultiplier,
}: {
  source: AnalyzerStrategyCandidate;
  ticker: string;
  strategyType: ReviewExactSetupRequest["strategyType"];
  underlyingPrice: number;
  shortStrike: number;
  longStrike: number;
  creditMultiplier: number;
}): AnalyzerStrategyCandidate | null {
  const width = Math.abs(shortStrike - longStrike);
  if (!Number.isFinite(width) || width <= 0) return null;
  if (shortStrike <= 0 || longStrike <= 0) return null;

  const baseCredit = source.netCredit ?? source.premium ?? width * 0.18;
  const netCredit = Number(
    Math.max(0.05, Math.min(width * 0.45, baseCredit * creditMultiplier)).toFixed(2)
  );
  const maxLoss = Number((width - netCredit).toFixed(2));
  if (!Number.isFinite(maxLoss) || maxLoss <= 0) return null;

  const returnOnRisk = Number((netCredit / maxLoss).toFixed(2));
  const strategyName =
    strategyType === "put_credit_spread" ? "Put Credit Spread" : "Call Credit Spread";
  const optionWord = strategyType === "put_credit_spread" ? "Put" : "Call";

  const outsideExpectedMove =
    source.expectedMoveLow != null && source.expectedMoveHigh != null
      ? strategyType === "put_credit_spread"
        ? shortStrike < source.expectedMoveLow && longStrike < source.expectedMoveLow
        : shortStrike > source.expectedMoveHigh && longStrike > source.expectedMoveHigh
      : source.outsideExpectedMove;

  return {
    ...source,
    strategy: strategyName,
    setupLabel: `${ticker} ${source.expiration} ${shortStrike}/${longStrike} ${optionWord} Credit Spread`,
    shortStrike,
    longStrike,
    width,
    premium: netCredit,
    netCredit,
    maxLoss,
    returnOnRisk,
    downsideBufferScore: scoreDistanceBuffer(strategyType, underlyingPrice, shortStrike),
    premiumScore: scorePremiumForCredit(returnOnRisk),
    creditPctWidth: Number(((netCredit / width) * 100).toFixed(2)),
    maxLossRatio: Number((maxLoss / netCredit).toFixed(2)),
    outsideExpectedMove,
  };
}

function buildNearbyReviewCandidates({
  ticker,
  underlyingPrice,
  request,
  optionRows,
  expectedMoveLow,
  expectedMoveHigh,
  nextEarningsDate,
}: {
  ticker: string;
  underlyingPrice: number;
  request: ReviewExactSetupRequest;
  optionRows: Parameters<typeof buildExactRequestedCreditSpread>[0]["optionRows"];
  expectedMoveLow: number | null;
  expectedMoveHigh: number | null;
  nextEarningsDate: string | null;
}): AnalyzerStrategyCandidate[] {
  const width = Math.abs(request.shortStrike - request.longStrike);
  if (!Number.isFinite(width) || width <= 0) return [];

  const build = (shortStrike: number, longStrike: number) =>
    buildExactRequestedCreditSpread({
      ticker,
      underlyingPrice,
      strategyType: request.strategyType,
      expiration: request.expiration,
      shortStrike,
      longStrike,
      optionRows,
      expectedMoveLow,
      expectedMoveHigh,
      nextEarningsDate,
    });

  const exact = build(request.shortStrike, request.longStrike);
  if (!exact) return [];

  let moreRoomShort: number | null = null;
  let moreRoomLong: number | null = null;
  let moreCreditShort: number | null = null;
  let moreCreditLong: number | null = null;

  if (request.strategyType === "put_credit_spread") {
    moreRoomShort = request.shortStrike - width;
    moreRoomLong = request.longStrike - width;
    moreCreditShort = request.shortStrike + width;
    moreCreditLong = request.longStrike + width;
  } else if (request.strategyType === "call_credit_spread") {
    moreRoomShort = request.shortStrike + width;
    moreRoomLong = request.longStrike + width;
    moreCreditShort = request.shortStrike - width;
    moreCreditLong = request.longStrike - width;
  }

  const moreRoomBuilt =
    moreRoomShort != null && moreRoomLong != null
      ? build(moreRoomShort, moreRoomLong) ??
        buildReviewFallbackCandidate({
          source: exact,
          ticker,
          strategyType: request.strategyType,
          underlyingPrice,
          shortStrike: moreRoomShort,
          longStrike: moreRoomLong,
          creditMultiplier: 0.75,
        })
      : null;

  const moreCreditBuilt =
    moreCreditShort != null && moreCreditLong != null
      ? build(moreCreditShort, moreCreditLong) ??
        buildReviewFallbackCandidate({
          source: exact,
          ticker,
          strategyType: request.strategyType,
          underlyingPrice,
          shortStrike: moreCreditShort,
          longStrike: moreCreditLong,
          creditMultiplier: 1.25,
        })
      : null;

  return [exact, moreRoomBuilt, moreCreditBuilt].filter(
    (candidate): candidate is AnalyzerStrategyCandidate => Boolean(candidate)
  );
}

export async function analyzeTicker(
  ticker: string,
  entryRequest?: AnalyzerEntryRequest
): Promise<AnalysisResponse> {
  const input = await buildSeededAnalyzerInput(ticker);
  const isExactReview = entryRequest?.mode === "review";

  let requestedSetupSelection:
    | {
        strategy: string;
        expiration: string;
        shortStrike: number;
        longStrike: number;
      }
    | null = null;

  if (isExactReview) {
    const request = entryRequest as ReviewExactSetupRequest;

    if (
      !request.expiration ||
      request.shortStrike == null ||
      request.longStrike == null ||
      !request.strategyType
    ) {
      throw new Error(
        "Review mode requires an expiration date, strategy type, short strike, and long strike."
      );
    }

    const rows = await currentOptionsDataSource.getOptionsChainForExpiration(
      request.ticker,
      request.expiration
    );

    const reviewCandidates = buildNearbyReviewCandidates({
      ticker: input.ticker,
      underlyingPrice: input.underlyingPrice,
      request,
      optionRows: rows,
      expectedMoveLow: input.expectedMoveContext.expectedMoveLow,
      expectedMoveHigh: input.expectedMoveContext.expectedMoveHigh,
      nextEarningsDate: input.eventContext.nextEarningsDate ?? null,
    });

    const exactCandidate = reviewCandidates.find(
      (candidate) =>
        candidate.expiration === request.expiration &&
        candidate.shortStrike === request.shortStrike &&
        candidate.longStrike === request.longStrike
    );

    if (!exactCandidate) {
      throw new Error(
        "The requested setup could not be built from the available option chain for that expiration."
      );
    }

    input.candidateStrategies = mergeCandidates(
      input.candidateStrategies,
      reviewCandidates
    );

    requestedSetupSelection = {
      strategy: exactCandidate.strategy,
      expiration: exactCandidate.expiration,
      shortStrike: exactCandidate.shortStrike,
      longStrike: exactCandidate.longStrike,
    };
  }

  const marketCondition = assessMarketCondition(input);
  const volatilityCondition = assessVolatilityCondition(input);
  const eventRisk = assessEventRisk(input);

  const {
    bestStrategy,
    bestCandidate,
    currentComparedSetup,
    saferAlternative,
    aggressiveAlternative,
    comparedSetups,
    survivingCandidates,
    bestCandidateScore,
    bestCandidateBand,
  } = rankStrategies(input, requestedSetupSelection);

  const candidateCount = survivingCandidates.length;

  const decision = deriveDecision({
    input,
    bestStrategy,
    candidateCount,
    bestCandidateScore,
    bestCandidateBand,
    isExactReview,
  });

  const analyzedAt = new Date();

  const eventRisks = deriveEventRisks({
    input,
    selectedCandidate: bestCandidate,
    asOf: analyzedAt,
  });

  const risks = deriveRisks({
    input,
    bestStrategy,
    candidateCount,
    isExactReview,
  });

  const explanation = buildExplanation({
    ticker: input.ticker,
    marketCondition,
    volatilityCondition,
    eventRisk,
    decision,
    bestStrategy,
  });

  const evidence = buildAnalysisEvidence({
    selectedCandidate: bestCandidate,
    underlyingPrice: input.underlyingPrice,
    impliedVolatilityLabel:
      input.volatilityContext?.impliedVolatilityLabel ?? null,
  });

  const screenedExpirations = new Set(
    input.candidateStrategies
      .map((candidate) => candidate.expiration)
      .filter(Boolean)
  );

  return {
    ticker: input.ticker,
    price: input.underlyingPrice,
    marketCondition,
    volatilityCondition,
    eventRisk,
    eventRisks,
    decision,
    bestStrategy,
    evidence,
    currentComparedSetup,
    comparedSetups,
    saferAlternative,
    aggressiveAlternative,
    risks,
    explanation,
    metadata: buildAnalysisMetadata({
      input,
      selectedCandidate: bestCandidate,
      isExactReview,
      screenedExpirationCount: screenedExpirations.size || null,
      noCleanSetup: !bestStrategy,
      asOf: analyzedAt,
    }),
  };
}
