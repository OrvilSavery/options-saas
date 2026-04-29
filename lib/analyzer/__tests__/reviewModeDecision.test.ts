import { describe, expect, it } from "vitest";
import { rankStrategies } from "@/lib/analyzer/scoring/rankStrategies";
import { deriveDecision } from "@/lib/analyzer/decision/deriveDecision";
import { deriveRisks } from "@/lib/analyzer/decision/deriveRisks";
import { scoreSetup } from "@/lib/analyzer/scoring/credit-spread/scoreSetup";
import { makeAnalyzerInput, makeCandidate, futureDate, baseEngineParams } from "@/lib/analyzer/test-utils/creditSpreadFixtures";
import type { AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";

function runReviewMode(candidateOverrides: Partial<AnalyzerStrategyCandidate> = {}) {
  const expiration = futureDate(35);
  const candidate = makeCandidate({ expiration, ...candidateOverrides });
  const input = makeAnalyzerInput({ candidateStrategies: [candidate] });
  const requestedSetup = {
    strategy: candidate.strategy,
    expiration,
    shortStrike: candidate.shortStrike,
    longStrike: candidate.longStrike,
  };
  const ranked = rankStrategies(input, requestedSetup);
  const candidateCount = ranked.survivingCandidates.length;
  const decision = deriveDecision({
    input,
    bestStrategy: ranked.bestStrategy,
    candidateCount,
    bestCandidateScore: ranked.bestCandidateScore,
    bestCandidateBand: ranked.bestCandidateBand,
    isExactReview: true,
  });
  const risks = deriveRisks({
    input,
    bestStrategy: ranked.bestStrategy,
    candidateCount,
    isExactReview: true,
  });
  return { ranked, decision, risks };
}

describe("Review mode — exact setup preserved even when failing", () => {
  it("preserves bestCandidate for DTE below 7 and returns pass", () => {
    const { ranked, decision, risks } = runReviewMode({ daysToExpiration: 6 });

    expect(ranked.bestCandidate).not.toBeNull();
    expect(ranked.currentComparedSetup).not.toBeNull();
    expect(decision).toBe("pass");
    expect(risks.length).toBeGreaterThan(0);
  });

  it("preserves bestCandidate for credit below 15% width and returns pass", () => {
    const { ranked, decision } = runReviewMode({ creditPctWidth: 14 });

    expect(ranked.bestCandidate).not.toBeNull();
    expect(decision).toBe("pass");
  });

  it("preserves bestCandidate for bid/ask above 15% credit and returns pass", () => {
    const { ranked, decision } = runReviewMode({ bidAskPct: 16 });

    expect(ranked.bestCandidate).not.toBeNull();
    expect(decision).toBe("pass");
  });

  it("preserves bestCandidate when earnings fall inside expiry window and returns pass", () => {
    const { ranked, decision, risks } = runReviewMode({ earningsInWindow: true });

    expect(ranked.bestCandidate).not.toBeNull();
    expect(decision).toBe("pass");
    expect(risks.length).toBeGreaterThan(0);
  });

  it("does not produce valid posture for inside expected move with medium event risk", () => {
    const expiration = futureDate(35);
    const candidate = makeCandidate({ expiration, outsideExpectedMove: false });
    const input = makeAnalyzerInput({
      eventContext: { risk: "medium", nextEarningsDate: null, eventSourceQuality: "mock", scheduledEvents: [] },
      candidateStrategies: [candidate],
    });
    const requestedSetup = {
      strategy: candidate.strategy,
      expiration,
      shortStrike: candidate.shortStrike,
      longStrike: candidate.longStrike,
    };
    const ranked = rankStrategies(input, requestedSetup);
    const candidateCount = ranked.survivingCandidates.length;
    const decision = deriveDecision({
      input,
      bestStrategy: ranked.bestStrategy,
      candidateCount,
      bestCandidateScore: ranked.bestCandidateScore,
      bestCandidateBand: ranked.bestCandidateBand,
      isExactReview: true,
    });

    expect(ranked.bestCandidate).not.toBeNull();
    expect(decision).not.toBe("valid");
  });

  it("returns pass for aggressive short delta combined with short DTE", () => {
    // delta=0.40 + dte=14 triggers gamma trap → total falls below 65
    const { ranked, decision } = runReviewMode({ shortDelta: 0.40, daysToExpiration: 14 });

    expect(ranked.bestCandidate).not.toBeNull();
    expect(decision).toBe("pass");
  });
});

describe("Review mode — inside expected move is a penalty, not a disqualifier", () => {
  it("does not DQ a setup that is inside the expected move", () => {
    const result = scoreSetup({ ...baseEngineParams, outsideEM: false });

    expect(result.dq).toEqual([]);
    expect(result.total).toBeGreaterThan(0);
  });

  it("inside expected move scores lower than outside for the same setup", () => {
    const outside = scoreSetup({ ...baseEngineParams, outsideEM: true });
    const inside = scoreSetup({ ...baseEngineParams, outsideEM: false });

    expect(outside.total).toBeGreaterThan(inside.total);
  });
});
