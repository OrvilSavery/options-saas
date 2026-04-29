import { describe, expect, it } from "vitest";
import { scoreSetup, scoreTiming, scoreStrikeQuality, scoreVolatility } from "@/lib/analyzer/scoring/credit-spread/scoreSetup";
import { applyCandidateHardGates } from "@/lib/analyzer/gates/applyCandidateHardGates";
import { makeCandidate } from "@/lib/analyzer/test-utils/creditSpreadFixtures";
import { baseEngineParams } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

describe("DTE boundary sensitivity", () => {
  it("DTE 6 is disqualified by the engine (below the 7-day floor)", () => {
    const result = scoreSetup({ ...baseEngineParams, dte: 6 });
    expect(result.dq.length).toBeGreaterThan(0);
    expect(result.total).toBe(0);
  });

  it("DTE 7 clears the engine DQ check but scores the lowest timing", () => {
    const result = scoreSetup({ ...baseEngineParams, dte: 7 });
    expect(result.dq).toEqual([]);
    expect(result.timing).toBe(0);
  });

  it("DTE 14 scores timing above 0", () => {
    const result = scoreSetup({ ...baseEngineParams, dte: 14 });
    expect(result.dq).toEqual([]);
    expect(result.timing).toBeGreaterThan(0);
  });

  it("DTE 21 scores higher timing than DTE 14", () => {
    const at14 = scoreTiming(14, null);
    const at21 = scoreTiming(21, null);
    expect(at21).toBeGreaterThan(at14);
  });

  it("DTE 28–45 is the sweet spot (max timing = 25)", () => {
    expect(scoreTiming(28, null)).toBe(25);
    expect(scoreTiming(45, null)).toBe(25);
  });

  it("DTE 60 scores lower timing than DTE 45", () => {
    const at45 = scoreTiming(45, null);
    const at60 = scoreTiming(60, null);
    expect(at45).toBeGreaterThan(at60);
  });

  it("DTE 61 is blocked by the hard gate (not a score issue — gate issue)", () => {
    expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 61 }), 550)).toBe(false);
    // Engine itself does not DQ DTE 61
    const result = scoreSetup({ ...baseEngineParams, dte: 61 });
    expect(result.dq).toEqual([]);
  });
});

describe("Delta boundary sensitivity", () => {
  it("optimal delta range 0.15–0.22 scores higher strike quality than aggressive delta > 0.28", () => {
    const optimal = scoreStrikeQuality(0.18, 28, true);
    const aggressive = scoreStrikeQuality(0.30, 28, true);
    expect(optimal).toBeGreaterThan(aggressive);
  });

  it("delta 0.15 scores higher than delta 0.14 (at the boundary)", () => {
    const at15 = scoreStrikeQuality(0.15, 28, true);
    const at14 = scoreStrikeQuality(0.14, 28, true);
    expect(at15).toBeGreaterThan(at14);
  });

  it("delta 0.22 scores lower than delta 0.18 (approaching the aggressive zone)", () => {
    const at18 = scoreStrikeQuality(0.18, 28, true);
    const at22 = scoreStrikeQuality(0.22, 28, true);
    expect(at18).toBeGreaterThan(at22);
  });

  it("delta 0.24 scores lower than delta 0.22", () => {
    const at22 = scoreStrikeQuality(0.22, 28, true);
    const at24 = scoreStrikeQuality(0.24, 28, true);
    expect(at22).toBeGreaterThan(at24);
  });

  it("delta 0.25 scores lower than delta 0.24", () => {
    const at24 = scoreStrikeQuality(0.24, 28, true);
    const at25 = scoreStrikeQuality(0.25, 28, true);
    expect(at24).toBeGreaterThan(at25);
  });

  it("delta 0.30 scores significantly lower strike quality than 0.22", () => {
    const at22 = scoreStrikeQuality(0.22, 28, true);
    const at30 = scoreStrikeQuality(0.30, 28, true);
    // 0.28–0.30 zone: base lerps from 12 down to 4; combined score is well below optimal
    expect(at22).toBeGreaterThan(at30 * 1.5);
  });

  it("delta 0.35 scores at or near zero for the base component", () => {
    // 0.3 < 0.35 <= 0.35 → base = lerp(0, 4, 0) = 0
    const score = scoreStrikeQuality(0.35, 28, true);
    // With credit bonus and EM modifier the total is still low
    expect(score).toBeLessThan(15);
  });
});

describe("IV rank boundary sensitivity", () => {
  it("IV rank 35 scores higher than IV rank 34 (penalty boundary)", () => {
    const at34 = scoreVolatility(34, 1.28);
    const at35 = scoreVolatility(35, 1.28);
    expect(at35).toBeGreaterThan(at34);
  });

  it("IV rank 50 scores higher than IV rank 44 (entering upper tier)", () => {
    const at44 = scoreVolatility(44, 1.28);
    const at50 = scoreVolatility(50, 1.28);
    expect(at50).toBeGreaterThan(at44);
  });

  it("IV rank 75 achieves the highest volatility score", () => {
    const at65 = scoreVolatility(65, 1.28);
    const at75 = scoreVolatility(75, 1.28);
    expect(at75).toBeGreaterThanOrEqual(at65);
  });
});

describe("Bid/ask boundary — engine DQ fires when strictly above 15%", () => {
  it("bidAskPct 14.9 is not DQ'd by the engine", () => {
    const result = scoreSetup({ ...baseEngineParams, bidAskPct: 14.9 });
    expect(result.dq).toEqual([]);
  });

  it("bidAskPct 15.0 is not DQ'd by the engine (threshold is > 15, not >= 15)", () => {
    const result = scoreSetup({ ...baseEngineParams, bidAskPct: 15 });
    expect(result.dq).toEqual([]);
  });

  it("bidAskPct 15.1 is DQ'd by the engine", () => {
    const result = scoreSetup({ ...baseEngineParams, bidAskPct: 15.1 });
    expect(result.dq).toContain("Bid-ask spread exceeds 15% of credit (liquidity fail)");
    expect(result.total).toBe(0);
  });
});

describe("Credit-to-width boundary — engine DQ fires when strictly below 15%", () => {
  it("creditPctWidth 14.9 is DQ'd by the engine", () => {
    const result = scoreSetup({ ...baseEngineParams, creditPctWidth: 14.9 });
    expect(result.dq).toContain("Credit below 15% of wing width (minimum viability)");
    expect(result.total).toBe(0);
  });

  it("creditPctWidth 15.0 is not DQ'd by the engine (threshold is < 15, not <= 15)", () => {
    const result = scoreSetup({ ...baseEngineParams, creditPctWidth: 15 });
    expect(result.dq).toEqual([]);
  });

  it("creditPctWidth 15.1 is not DQ'd by the engine", () => {
    const result = scoreSetup({ ...baseEngineParams, creditPctWidth: 15.1 });
    expect(result.dq).toEqual([]);
  });
});
