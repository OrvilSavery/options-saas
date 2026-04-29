import { describe, expect, it } from "vitest";
import { buildEngineParams } from "@/lib/analyzer/scoring/credit-spread/buildEngineParams";
import { rankStrategies } from "@/lib/analyzer/scoring/rankStrategies";
import { applyCandidateHardGates } from "@/lib/analyzer/gates/applyCandidateHardGates";
import { makeAnalyzerInput, makeCandidate } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

describe("data degradation — missing or null inputs", () => {
  it("returns null engine params when ivRank is null, and does not crash", () => {
    const candidate = makeCandidate({ ivRank: null });
    const input = makeAnalyzerInput({ candidateStrategies: [candidate] });

    expect(buildEngineParams(input, candidate)).toBeNull();

    const result = rankStrategies(input);
    expect(result.bestCandidate).not.toBeNull();
  });

  it("returns null engine params when ivHvRatio is null, and does not crash", () => {
    const candidate = makeCandidate({ ivHvRatio: null });
    const input = makeAnalyzerInput({ candidateStrategies: [candidate] });

    expect(buildEngineParams(input, candidate)).toBeNull();

    const result = rankStrategies(input);
    expect(result.bestCandidate).not.toBeNull();
  });

  it("returns null engine params when bidAskPct is null, and null bidAskPct passes the hard gate", () => {
    const candidate = makeCandidate({ bidAskPct: null });
    const input = makeAnalyzerInput({ candidateStrategies: [candidate] });

    expect(buildEngineParams(input, candidate)).toBeNull();
    // Null bidAskPct should not cause a false-positive gate block
    expect(applyCandidateHardGates(candidate, 550)).toBe(true);

    const result = rankStrategies(input);
    expect(result.bestCandidate).not.toBeNull();
  });

  it("returns null engine params when outsideExpectedMove is null", () => {
    const candidate = makeCandidate({ outsideExpectedMove: null });
    const input = makeAnalyzerInput({ candidateStrategies: [candidate] });

    expect(buildEngineParams(input, candidate)).toBeNull();
  });

  it("returns null engine params when earningsInWindow is null, and null does not trigger the gate", () => {
    const candidate = makeCandidate({ earningsInWindow: null });
    const input = makeAnalyzerInput({ candidateStrategies: [candidate] });

    expect(buildEngineParams(input, candidate)).toBeNull();
    // Null earningsInWindow is unknown, not confirmed — gate must not fire
    expect(applyCandidateHardGates(candidate, 550)).toBe(true);
  });

  it("does not crash when expected move bounds are null", () => {
    const candidate = makeCandidate({
      expectedMoveLow: null,
      expectedMoveHigh: null,
      outsideExpectedMove: null,
    });
    const input = makeAnalyzerInput({
      expectedMoveContext: { expectedMoveLow: null, expectedMoveHigh: null },
      candidateStrategies: [candidate],
    });

    expect(() => rankStrategies(input)).not.toThrow();
  });

  it("handles null volume and open interest without crashing", () => {
    const candidate = makeCandidate({
      shortLegVolume: null,
      longLegVolume: null,
      shortLegOpenInterest: null,
      longLegOpenInterest: null,
    });
    const input = makeAnalyzerInput({ candidateStrategies: [candidate] });

    const result = rankStrategies(input);
    expect(result.bestCandidate).not.toBeNull();
    // Execution label degrades gracefully when OI and volume are missing
    expect(result.currentComparedSetup?.executionLabel).toBeDefined();
  });

  it("handles null bid/ask leg widths without crashing", () => {
    const candidate = makeCandidate({
      shortLegBidAskWidth: null,
      longLegBidAskWidth: null,
      bidAskPct: null,
    });
    const input = makeAnalyzerInput({ candidateStrategies: [candidate] });

    const result = rankStrategies(input);
    expect(result.bestCandidate).not.toBeNull();
  });
});
