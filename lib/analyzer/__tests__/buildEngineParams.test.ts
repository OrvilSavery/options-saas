import { describe, expect, it } from "vitest";
import { buildEngineParams } from "@/lib/analyzer/scoring/credit-spread/buildEngineParams";
import { makeAnalyzerInput, makeCandidate } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

describe("buildEngineParams", () => {
  it("maps normalized candidate fields into scoring-engine params", () => {
    const input = makeAnalyzerInput();
    const candidate = makeCandidate({
      daysToExpiration: 35,
      shortDelta: -0.19,
      creditPctWidth: 26,
      maxLossRatio: 2.85,
      outsideExpectedMove: true,
      earningsInWindow: false,
      earningsDaysAfter: 9,
      bidAskPct: 7.5,
    });

    expect(buildEngineParams(input, candidate)).toEqual({
      ivRank: 62,
      ivHvRatio: 1.28,
      dte: 35,
      shortDelta: 0.19,
      creditPctWidth: 26,
      maxLossRatio: 2.85,
      outsideEM: true,
      earningsInWindow: false,
      earningsDaysAfter: 9,
      bidAskPct: 7.5,
    });
  });

  it("returns null instead of guessing when required scoring inputs are missing", () => {
    const input = makeAnalyzerInput();
    const candidate = makeCandidate({ ivRank: null });

    expect(buildEngineParams(input, candidate)).toBeNull();
  });
});
