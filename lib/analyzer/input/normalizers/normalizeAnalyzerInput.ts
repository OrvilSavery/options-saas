import type { AnalyzerInput } from "@/lib/analyzer/input/types";
import type { SeededAnalyzerInput } from "@/lib/analyzer/input/seeded/types";
import type { ImpliedVolatilityLabel } from "@/lib/market-data/types";
import {
  assertArray,
  assertDecision,
  assertDirectionalBias,
  assertEventRisk,
  assertFiniteNumber,
  assertNonEmptyString,
  assertNonNegativeNumber,
  assertPositiveNumber,
  assertRole,
} from "@/lib/analyzer/input/normalizers/guards";
import {
  normalizeOptionalNumber,
  normalizeRoundedNumber,
  normalizeText,
  normalizeTicker,
} from "@/lib/analyzer/input/normalizers/normalizeHelpers";

function assertImpliedVolatilityLabel(
  value: unknown,
  fieldName: string
): asserts value is ImpliedVolatilityLabel {
  if (value !== "low" && value !== "moderate" && value !== "high") {
    throw new Error(`${fieldName} must be one of: low, moderate, high.`);
  }
}

function normalizeOptionalBoolean(value: unknown): boolean | null {
  if (value == null) return null;
  if (typeof value !== "boolean") {
    throw new Error("Expected optional boolean field to be boolean or null.");
  }
  return value;
}

function normalizeOptionalString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") {
    throw new Error("Expected optional string field to be string or null.");
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}


function normalizeOptionalEventSeverity(value: unknown) {
  if (value == null) return null;
  if (value === "info" || value === "warning" || value === "danger") {
    return value;
  }
  throw new Error("Expected event severity to be one of: info, warning, danger.");
}

function normalizeOptionalEventSource(value: unknown) {
  if (value == null) return null;
  if (
    value === "mock" ||
    value === "calendar" ||
    value === "market" ||
    value === "manual" ||
    value === "unknown"
  ) {
    return value;
  }
  throw new Error("Expected event source to be one of: mock, calendar, market, manual, unknown.");
}

function normalizeScheduledEventType(value: unknown) {
  if (
    value === "earnings" ||
    value === "fomc" ||
    value === "cpi" ||
    value === "pce" ||
    value === "dividend" ||
    value === "sector" ||
    value === "macro" ||
    value === "other"
  ) {
    return value;
  }

  return "other";
}

function normalizeScheduledEvents(
  value: unknown
): NonNullable<AnalyzerInput["eventContext"]["scheduledEvents"]> {
  if (value == null) return [];
  assertArray(value, "eventContext.scheduledEvents");

  return value.map((event, index) => {
    if (event == null || typeof event !== "object") {
      throw new Error(`eventContext.scheduledEvents[${index}] must be an object.`);
    }

    const rawEvent = event as Record<string, unknown>;
    assertNonEmptyString(rawEvent.date, `eventContext.scheduledEvents[${index}].date`);

    return {
      id: normalizeOptionalString(rawEvent.id),
      type: normalizeScheduledEventType(rawEvent.type),
      label: normalizeOptionalString(rawEvent.label),
      date: normalizeText(rawEvent.date as string),
      severity: normalizeOptionalEventSeverity(rawEvent.severity),
      explanation: normalizeOptionalString(rawEvent.explanation),
      source: normalizeOptionalEventSource(rawEvent.source),
    };
  });
}

function normalizeOptionalStrategyType(
  value: unknown
): AnalyzerInput["candidateStrategies"][number]["strategyType"] {
  if (
    value === "put_credit_spread" ||
    value === "call_credit_spread" ||
    value === "other"
  ) {
    return value;
  }

  return "other";
}

function normalizeStrategyCandidate(
  candidate: SeededAnalyzerInput["candidateStrategies"][number],
  index: number
): AnalyzerInput["candidateStrategies"][number] {
  const extendedCandidate =
    candidate as typeof candidate &
      Partial<AnalyzerInput["candidateStrategies"][number]>;

  assertNonEmptyString(candidate.strategy, `candidateStrategies[${index}].strategy`);
  assertNonEmptyString(candidate.expiration, `candidateStrategies[${index}].expiration`);
  assertNonEmptyString(candidate.setupLabel, `candidateStrategies[${index}].setupLabel`);

  assertPositiveNumber(candidate.shortStrike, `candidateStrategies[${index}].shortStrike`);
  assertPositiveNumber(candidate.longStrike, `candidateStrategies[${index}].longStrike`);
  assertPositiveNumber(candidate.width, `candidateStrategies[${index}].width`);
  assertNonNegativeNumber(
    candidate.daysToExpiration,
    `candidateStrategies[${index}].daysToExpiration`
  );

  assertFiniteNumber(
    candidate.downsideBufferScore,
    `candidateStrategies[${index}].downsideBufferScore`
  );
  assertFiniteNumber(candidate.premiumScore, `candidateStrategies[${index}].premiumScore`);
  assertFiniteNumber(
    candidate.simplicityScore,
    `candidateStrategies[${index}].simplicityScore`
  );

  assertDirectionalBias(
    candidate.directionalBias,
    `candidateStrategies[${index}].directionalBias`
  );
  assertRole(candidate.role, `candidateStrategies[${index}].role`);

  if (candidate.premium != null) {
    assertFiniteNumber(candidate.premium, `candidateStrategies[${index}].premium`);
  }

  if (candidate.netCredit != null) {
    assertFiniteNumber(candidate.netCredit, `candidateStrategies[${index}].netCredit`);
  }

  if (candidate.maxLoss != null) {
    assertFiniteNumber(candidate.maxLoss, `candidateStrategies[${index}].maxLoss`);
  }

  if (candidate.returnOnRisk != null) {
    assertFiniteNumber(candidate.returnOnRisk, `candidateStrategies[${index}].returnOnRisk`);
  }

  if (candidate.shortLegBidAskWidth != null) {
    assertFiniteNumber(
      candidate.shortLegBidAskWidth,
      `candidateStrategies[${index}].shortLegBidAskWidth`
    );
  }

  if (candidate.longLegBidAskWidth != null) {
    assertFiniteNumber(
      candidate.longLegBidAskWidth,
      `candidateStrategies[${index}].longLegBidAskWidth`
    );
  }

  if (candidate.shortLegVolume != null) {
    assertFiniteNumber(
      candidate.shortLegVolume,
      `candidateStrategies[${index}].shortLegVolume`
    );
  }

  if (candidate.longLegVolume != null) {
    assertFiniteNumber(
      candidate.longLegVolume,
      `candidateStrategies[${index}].longLegVolume`
    );
  }

  if (candidate.shortLegOpenInterest != null) {
    assertFiniteNumber(
      candidate.shortLegOpenInterest,
      `candidateStrategies[${index}].shortLegOpenInterest`
    );
  }

  if (candidate.longLegOpenInterest != null) {
    assertFiniteNumber(
      candidate.longLegOpenInterest,
      `candidateStrategies[${index}].longLegOpenInterest`
    );
  }

  if (extendedCandidate.shortDelta != null) {
    assertFiniteNumber(
      extendedCandidate.shortDelta,
      `candidateStrategies[${index}].shortDelta`
    );
  }

  if (extendedCandidate.ivRank != null) {
    assertFiniteNumber(
      extendedCandidate.ivRank,
      `candidateStrategies[${index}].ivRank`
    );
  }

  if (extendedCandidate.ivHvRatio != null) {
    assertFiniteNumber(
      extendedCandidate.ivHvRatio,
      `candidateStrategies[${index}].ivHvRatio`
    );
  }

  if (extendedCandidate.creditPctWidth != null) {
    assertFiniteNumber(
      extendedCandidate.creditPctWidth,
      `candidateStrategies[${index}].creditPctWidth`
    );
  }

  if (extendedCandidate.maxLossRatio != null) {
    assertFiniteNumber(
      extendedCandidate.maxLossRatio,
      `candidateStrategies[${index}].maxLossRatio`
    );
  }

  if (extendedCandidate.bidAskPct != null) {
    assertFiniteNumber(
      extendedCandidate.bidAskPct,
      `candidateStrategies[${index}].bidAskPct`
    );
  }

  if (extendedCandidate.earningsDaysAfter != null) {
    assertFiniteNumber(
      extendedCandidate.earningsDaysAfter,
      `candidateStrategies[${index}].earningsDaysAfter`
    );
  }

  if (extendedCandidate.expectedMoveLow != null) {
    assertFiniteNumber(
      extendedCandidate.expectedMoveLow,
      `candidateStrategies[${index}].expectedMoveLow`
    );
  }

  if (extendedCandidate.expectedMoveHigh != null) {
    assertFiniteNumber(
      extendedCandidate.expectedMoveHigh,
      `candidateStrategies[${index}].expectedMoveHigh`
    );
  }

  return {
    strategy: normalizeText(candidate.strategy),
    expiration: normalizeText(candidate.expiration),
    setupLabel: normalizeText(candidate.setupLabel),

    shortStrike: normalizeRoundedNumber(candidate.shortStrike),
    longStrike: normalizeRoundedNumber(candidate.longStrike),
    width: normalizeRoundedNumber(candidate.width),
    daysToExpiration: candidate.daysToExpiration,

    premium: normalizeOptionalNumber(candidate.premium ?? null),
    netCredit: normalizeOptionalNumber(candidate.netCredit ?? null),
    maxLoss: normalizeOptionalNumber(candidate.maxLoss ?? null),
    returnOnRisk: normalizeOptionalNumber(candidate.returnOnRisk ?? null),

    downsideBufferScore: candidate.downsideBufferScore,
    premiumScore: candidate.premiumScore,
    simplicityScore: candidate.simplicityScore,

    shortLegBidAskWidth: normalizeOptionalNumber(candidate.shortLegBidAskWidth ?? null),
    longLegBidAskWidth: normalizeOptionalNumber(candidate.longLegBidAskWidth ?? null),
    shortLegVolume: normalizeOptionalNumber(candidate.shortLegVolume ?? null),
    longLegVolume: normalizeOptionalNumber(candidate.longLegVolume ?? null),
    shortLegOpenInterest: normalizeOptionalNumber(candidate.shortLegOpenInterest ?? null),
    longLegOpenInterest: normalizeOptionalNumber(candidate.longLegOpenInterest ?? null),

    directionalBias: candidate.directionalBias,
    role: candidate.role,

    strategyType: normalizeOptionalStrategyType(extendedCandidate.strategyType),
    shortDelta: normalizeOptionalNumber(extendedCandidate.shortDelta ?? null),
    ivRank: normalizeOptionalNumber(extendedCandidate.ivRank ?? null),
    ivHvRatio: normalizeOptionalNumber(extendedCandidate.ivHvRatio ?? null),
    creditPctWidth: normalizeOptionalNumber(extendedCandidate.creditPctWidth ?? null),
    maxLossRatio: normalizeOptionalNumber(extendedCandidate.maxLossRatio ?? null),
    bidAskPct: normalizeOptionalNumber(extendedCandidate.bidAskPct ?? null),
    outsideExpectedMove: normalizeOptionalBoolean(extendedCandidate.outsideExpectedMove),
    earningsInWindow: normalizeOptionalBoolean(extendedCandidate.earningsInWindow),
    earningsDaysAfter: normalizeOptionalNumber(extendedCandidate.earningsDaysAfter ?? null),
    expectedMoveLow: normalizeOptionalNumber(extendedCandidate.expectedMoveLow ?? null),
    expectedMoveHigh: normalizeOptionalNumber(extendedCandidate.expectedMoveHigh ?? null),
  };
}

export function normalizeAnalyzerInput(
  seededInput: SeededAnalyzerInput
): AnalyzerInput {
  const seededEventContext =
    seededInput.eventContext as SeededAnalyzerInput["eventContext"] & {
      nextEarningsDate?: string | null;
      eventSourceQuality?: string | null;
      scheduledEvents?: unknown;
    };

  assertNonEmptyString(seededInput.ticker, "ticker");
  assertPositiveNumber(seededInput.underlyingPrice, "underlyingPrice");
  assertNonEmptyString(seededInput.marketContext.summary, "marketContext.summary");
  assertNonEmptyString(
    seededInput.volatilityContext.summary,
    "volatilityContext.summary"
  );
  assertImpliedVolatilityLabel(
    seededInput.volatilityContext.impliedVolatilityLabel,
    "volatilityContext.impliedVolatilityLabel"
  );

  if (seededInput.expectedMoveContext.expectedMoveLow != null) {
    assertFiniteNumber(
      seededInput.expectedMoveContext.expectedMoveLow,
      "expectedMoveContext.expectedMoveLow"
    );
  }

  if (seededInput.expectedMoveContext.expectedMoveHigh != null) {
    assertFiniteNumber(
      seededInput.expectedMoveContext.expectedMoveHigh,
      "expectedMoveContext.expectedMoveHigh"
    );
  }

  assertEventRisk(seededInput.eventContext.risk, "eventContext.risk");
  assertDecision(seededInput.decisionContext.decision, "decisionContext.decision");
  assertArray(seededInput.decisionContext.risks, "decisionContext.risks");
  assertArray(seededInput.candidateStrategies, "candidateStrategies");

  const normalizedRisks = seededInput.decisionContext.risks.map((risk, index) => {
    assertNonEmptyString(risk, `decisionContext.risks[${index}]`);
    return normalizeText(risk);
  });

  const normalizedCandidates = seededInput.candidateStrategies.map((candidate, index) =>
    normalizeStrategyCandidate(candidate, index)
  );

  return {
    ticker: normalizeTicker(seededInput.ticker),
    underlyingPrice: normalizeRoundedNumber(seededInput.underlyingPrice),

    marketContext: {
      summary: normalizeText(seededInput.marketContext.summary),
    },

    volatilityContext: {
      summary: normalizeText(seededInput.volatilityContext.summary),
      impliedVolatilityLabel: seededInput.volatilityContext.impliedVolatilityLabel,
    },

    expectedMoveContext: {
      expectedMoveLow: normalizeOptionalNumber(
        seededInput.expectedMoveContext.expectedMoveLow ?? null
      ),
      expectedMoveHigh: normalizeOptionalNumber(
        seededInput.expectedMoveContext.expectedMoveHigh ?? null
      ),
    },

    eventContext: {
      risk: seededInput.eventContext.risk,
      nextEarningsDate: normalizeOptionalString(seededEventContext.nextEarningsDate),
      eventSourceQuality: normalizeOptionalString(seededEventContext.eventSourceQuality),
      scheduledEvents: normalizeScheduledEvents(seededEventContext.scheduledEvents),
    },

    decisionContext: {
      decision: seededInput.decisionContext.decision,
      risks: normalizedRisks,
    },

    candidateStrategies: normalizedCandidates,
  };
}
