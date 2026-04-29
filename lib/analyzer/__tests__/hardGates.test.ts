import { describe, expect, it } from "vitest";
import { applyCandidateHardGates } from "@/lib/analyzer/gates/applyCandidateHardGates";
import { makeCandidate } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

describe("candidate hard gates", () => {
  it("allows a clean candidate inside the allowed DTE window", () => {
    expect(applyCandidateHardGates(makeCandidate(), 550)).toBe(true);
  });

  it("blocks 0 DTE candidates in Find setups mode", () => {
    expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 0 }), 550)).toBe(false);
  });

  it("blocks candidates beyond the 60 DTE hard window", () => {
    expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 61 }), 550)).toBe(false);
  });

  it("blocks bad directional room for put credit spreads", () => {
    expect(applyCandidateHardGates(makeCandidate({ shortStrike: 555, longStrike: 550 }), 550)).toBe(false);
  });

  it("blocks low credit relative to wing width", () => {
    expect(applyCandidateHardGates(makeCandidate({ creditPctWidth: 14.9 }), 550)).toBe(false);
  });

  it("blocks wide bid/ask execution", () => {
    expect(applyCandidateHardGates(makeCandidate({ bidAskPct: 16 }), 550)).toBe(false);
  });

  it("blocks earnings inside expiration window", () => {
    expect(applyCandidateHardGates(makeCandidate({ earningsInWindow: true }), 550)).toBe(false);
  });

  describe("DTE boundary — 7 is the minimum, 60 is the maximum", () => {
    it("blocks DTE 6 (below minimum)", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 6 }), 550)).toBe(false);
    });

    it("passes DTE 7 (exactly the minimum)", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 7 }), 550)).toBe(true);
    });

    it("passes DTE 14", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 14 }), 550)).toBe(true);
    });

    it("passes DTE 21", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 21 }), 550)).toBe(true);
    });

    it("passes DTE 24", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 24 }), 550)).toBe(true);
    });

    it("passes DTE 28", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 28 }), 550)).toBe(true);
    });

    it("passes DTE 45", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 45 }), 550)).toBe(true);
    });

    it("passes DTE 60 (exactly the maximum)", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 60 }), 550)).toBe(true);
    });

    it("blocks DTE 61 (above maximum)", () => {
      expect(applyCandidateHardGates(makeCandidate({ daysToExpiration: 61 }), 550)).toBe(false);
    });
  });

  describe("bid/ask boundary — blocked when strictly above 15%", () => {
    it("passes bidAskPct 14.9", () => {
      expect(applyCandidateHardGates(makeCandidate({ bidAskPct: 14.9 }), 550)).toBe(true);
    });

    it("passes bidAskPct 15.0 (not strictly above threshold)", () => {
      expect(applyCandidateHardGates(makeCandidate({ bidAskPct: 15.0 }), 550)).toBe(true);
    });

    it("blocks bidAskPct 15.1 (strictly above threshold)", () => {
      expect(applyCandidateHardGates(makeCandidate({ bidAskPct: 15.1 }), 550)).toBe(false);
    });
  });

  describe("credit-to-width boundary — blocked when strictly below 15%", () => {
    it("blocks creditPctWidth 14.9 (strictly below threshold)", () => {
      expect(applyCandidateHardGates(makeCandidate({ creditPctWidth: 14.9 }), 550)).toBe(false);
    });

    it("passes creditPctWidth 15.0 (exactly the minimum)", () => {
      expect(applyCandidateHardGates(makeCandidate({ creditPctWidth: 15.0 }), 550)).toBe(true);
    });

    it("passes creditPctWidth 15.1", () => {
      expect(applyCandidateHardGates(makeCandidate({ creditPctWidth: 15.1 }), 550)).toBe(true);
    });
  });
});
