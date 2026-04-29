import { describe, expect, it } from "vitest";
import {
  checkDisqualifiers,
  crossCategoryModifiers,
  generateRiskFlags,
  scoreSetup,
} from "@/lib/analyzer/scoring/credit-spread/scoreSetup";
import { baseEngineParams } from "@/lib/analyzer/test-utils/creditSpreadFixtures";
import type { CreditSpreadEngineRiskFlag } from "@/lib/analyzer/scoring/credit-spread/types";

/**
 * Analyzer Logic Audit + Edge-Case Validation v1
 *
 * These tests lock the deterministic credit-spread engine behavior. They do not
 * expose scores in the UI; they only protect the backend posture/ranking inputs.
 */
describe("credit spread scoring engine", () => {
  it("scores a structurally clean premium-selling setup as reviewable", () => {
    const result = scoreSetup(baseEngineParams);

    expect(result.dq).toEqual([]);
    expect(result.total).toBeGreaterThanOrEqual(65);
    expect(["good_setup", "high_conviction"]).toContain(result.verdict.band);
  });

  it("hard-disqualifies 0 DTE and sub-7 DTE setups", () => {
    const reasons = checkDisqualifiers({
      ...baseEngineParams,
      dte: 0,
    });

    expect(reasons).toContain("DTE below 7 (insufficient time for thesis)");
    expect(scoreSetup({ ...baseEngineParams, dte: 0 }).verdict.band).toBe("disqualified");
  });

  it("hard-disqualifies thin premium below 15% of wing width", () => {
    const result = scoreSetup({
      ...baseEngineParams,
      creditPctWidth: 14.99,
    });

    expect(result.dq).toContain("Credit below 15% of wing width (minimum viability)");
    expect(result.total).toBe(0);
  });

  it("hard-disqualifies wide bid/ask execution above 15% of credit", () => {
    const result = scoreSetup({
      ...baseEngineParams,
      bidAskPct: 15.01,
    });

    expect(result.dq).toContain("Bid-ask spread exceeds 15% of credit (liquidity fail)");
    expect(result.total).toBe(0);
  });

  it("hard-disqualifies earnings inside the expiration window", () => {
    const result = scoreSetup({
      ...baseEngineParams,
      earningsInWindow: true,
    });

    expect(result.dq).toContain("Earnings announcement falls inside expiry window");
    expect(result.total).toBe(0);
  });

  it("applies gamma trap only for short DTE plus high delta", () => {
    const mods = crossCategoryModifiers({
      ...baseEngineParams,
      dte: 20,
      shortDelta: 0.3,
    });

    expect(mods.some((mod) => mod.id === "gamma_trap")).toBe(true);
  });

  it("does not apply the vol trap in the intended dead zone", () => {
    const mods = crossCategoryModifiers({
      ...baseEngineParams,
      ivRank: 48,
      shortDelta: 0.23,
    });

    expect(mods.some((mod) => mod.id === "vol_trap")).toBe(false);
  });

  it("generates plain-language risk flags from deterministic engine penalties", () => {
    const params = {
      ...baseEngineParams,
      dte: 18,
      shortDelta: 0.31,
      outsideEM: false,
      ivRank: 38,
    };
    const result = scoreSetup(params);
    const flags = generateRiskFlags(params, result);

    expect(flags.length).toBeGreaterThan(0);
    expect(flags.some((flag: CreditSpreadEngineRiskFlag) => flag.text.includes("gamma") || flag.text.includes("Aggressive"))).toBe(true);
  });
});
