import { describe, expect, it } from "vitest";
import { rankStrategies } from "@/lib/analyzer/scoring/rankStrategies";
import { makeAnalyzerInput, makeCandidate, futureDate } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

describe("rankStrategies Review vs Find behavior", () => {
  it("does not surface hard-gated candidates in Find setups mode", () => {
    const input = makeAnalyzerInput({
      candidateStrategies: [
        makeCandidate({ daysToExpiration: 0, setupLabel: "0 DTE invalid" }),
        makeCandidate({ creditPctWidth: 10, setupLabel: "thin credit invalid" }),
      ],
    });

    const result = rankStrategies(input);

    expect(result.bestCandidate).toBeNull();
    expect(result.bestStrategy).toBeNull();
    expect(result.survivingCandidates).toEqual([]);
  });

  it("preserves the exact requested setup in Review mode even when weak/pass", () => {
    const expiration = futureDate(10);
    const requested = makeCandidate({
      expiration,
      setupLabel: "SPY requested weak setup",
      shortStrike: 548,
      longStrike: 543,
      width: 5,
      daysToExpiration: 10,
      downsideBufferScore: 1,
      shortDelta: 0.33,
      creditPctWidth: 16,
      bidAskPct: 14,
      outsideExpectedMove: false,
      role: "balanced",
    });

    const input = makeAnalyzerInput({ candidateStrategies: [requested] });
    const result = rankStrategies(input, {
      strategy: requested.strategy,
      expiration,
      shortStrike: requested.shortStrike,
      longStrike: requested.longStrike,
    });

    expect(result.bestCandidate).not.toBeNull();
    expect(result.bestCandidate?.shortStrike).toBe(548);
    expect(result.bestCandidate?.longStrike).toBe(543);
    expect(result.currentComparedSetup?.role).toBe("current");
  });

  it("builds coherent same-expiration, same-width Review comparisons", () => {
    const expiration = futureDate(35);
    const moreRoom = makeCandidate({
      expiration,
      shortStrike: 520,
      longStrike: 515,
      width: 5,
      netCredit: 1.0,
      premium: 1.0,
      role: "safer",
      setupLabel: "SPY more room setup",
    });
    const requested = makeCandidate({
      expiration,
      shortStrike: 525,
      longStrike: 520,
      width: 5,
      netCredit: 1.4,
      premium: 1.4,
      role: "balanced",
      setupLabel: "SPY requested setup",
    });
    const moreCredit = makeCandidate({
      expiration,
      shortStrike: 530,
      longStrike: 525,
      width: 5,
      netCredit: 1.75,
      premium: 1.75,
      role: "aggressive",
      setupLabel: "SPY more credit setup",
    });

    const input = makeAnalyzerInput({ candidateStrategies: [moreRoom, requested, moreCredit] });
    const result = rankStrategies(input, {
      strategy: requested.strategy,
      expiration,
      shortStrike: requested.shortStrike,
      longStrike: requested.longStrike,
    });

    expect(result.currentComparedSetup?.shortStrike).toBe(525);
    expect(result.comparedSetups.length).toBeGreaterThanOrEqual(2);
    expect(result.comparedSetups.every((setup) => setup.expiration === expiration)).toBe(true);
    expect(result.comparedSetups.every((setup) => setup.width === 5)).toBe(true);
  });
});
