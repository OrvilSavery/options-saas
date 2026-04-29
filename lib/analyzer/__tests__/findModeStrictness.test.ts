import { describe, expect, it } from "vitest";
import { rankStrategies } from "@/lib/analyzer/scoring/rankStrategies";
import { deriveDecision } from "@/lib/analyzer/decision/deriveDecision";
import { makeAnalyzerInput, makeCandidate, futureDate } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

describe("Find mode strictness — hard-gated setups are not surfaced", () => {
  it("returns null result when all candidates fail hard gates", () => {
    const input = makeAnalyzerInput({
      candidateStrategies: [
        makeCandidate({ daysToExpiration: 0, setupLabel: "0 DTE blocked" }),
        makeCandidate({ creditPctWidth: 10, setupLabel: "thin credit blocked" }),
        makeCandidate({ bidAskPct: 20, setupLabel: "wide spread blocked" }),
      ],
    });

    const result = rankStrategies(input);

    expect(result.bestStrategy).toBeNull();
    expect(result.bestCandidate).toBeNull();
    expect(result.survivingCandidates).toEqual([]);
    expect(result.comparedSetups).toEqual([]);
  });

  it("surfaces a single passing candidate with watchlist posture (no comparison support)", () => {
    const expiration = futureDate(14);
    const candidate = makeCandidate({
      expiration,
      daysToExpiration: 14,
      setupLabel: "SPY single passing candidate",
    });
    const input = makeAnalyzerInput({ candidateStrategies: [candidate] });

    const result = rankStrategies(input);
    const candidateCount = result.survivingCandidates.length;
    const decision = deriveDecision({
      input,
      bestStrategy: result.bestStrategy,
      candidateCount,
      bestCandidateScore: result.bestCandidateScore,
      bestCandidateBand: result.bestCandidateBand,
      isExactReview: false,
    });

    expect(result.bestCandidate).not.toBeNull();
    // Single candidate without comparison support cannot be "valid"
    expect(decision).not.toBe("valid");
  });

  it("blocks a good-premium candidate when DTE is below 7", () => {
    const input = makeAnalyzerInput({
      candidateStrategies: [
        makeCandidate({
          daysToExpiration: 6,
          netCredit: 2.0,
          creditPctWidth: 40,
          setupLabel: "good premium bad DTE",
        }),
      ],
    });

    const result = rankStrategies(input);

    expect(result.bestStrategy).toBeNull();
    expect(result.survivingCandidates).toEqual([]);
  });

  it("blocks a good-DTE candidate when bid/ask is too wide", () => {
    const input = makeAnalyzerInput({
      candidateStrategies: [
        makeCandidate({
          daysToExpiration: 35,
          bidAskPct: 20,
          setupLabel: "good DTE bad execution",
        }),
      ],
    });

    const result = rankStrategies(input);

    expect(result.bestStrategy).toBeNull();
    expect(result.survivingCandidates).toEqual([]);
  });

  it("blocks a candidate with tight downside room (buffer score below 2)", () => {
    const input = makeAnalyzerInput({
      candidateStrategies: [
        makeCandidate({
          downsideBufferScore: 1,
          setupLabel: "attractive credit tight room",
        }),
      ],
    });

    const result = rankStrategies(input);

    expect(result.bestStrategy).toBeNull();
    expect(result.survivingCandidates).toEqual([]);
  });
});
