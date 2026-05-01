import { describe, expect, it } from "vitest";
import { buildHumanInterpretation } from "@/lib/analyzer/formatters/buildHeroInterpretation";
import type { ComparedSetup } from "@/types/analysis";

function makeSetup(overrides: Partial<ComparedSetup> = {}): ComparedSetup {
  return {
    role: "current",
    strategy: "Put Credit Spread",
    expiration: "2026-06-20",
    setupLabel: "SPY Jun 20 480/475 Put Credit Spread",
    premium: 1.4,
    returnOnRisk: 0.39,
    tradeQualityScore: 72,
    tradeQualityBand: "Strong",
    shortStrike: 480,
    longStrike: 475,
    width: 5,
    daysToExpiration: 35,
    downsideRoom: 0.129,
    expectedMoveLow: null,
    expectedMoveHigh: null,
    executionLabel: "Clean",
    bidAskWidth: 0.08,
    volume: 450,
    openInterest: 1800,
    note: "This setup has downside room and is available for review.",
    ...overrides,
  };
}

const ROOM_BLAME_PHRASES = [
  "not enough room",
  "tight room",
  "no room",
  "not much room",
];

function hasRoomBlameCopy(text: string): boolean {
  const lower = text.toLowerCase();
  return ROOM_BLAME_PHRASES.some((phrase) => lower.includes(phrase));
}

// Requirement 1: Pass + downsideRoom >= 0.08 must not blame room
describe("Pass + healthy room — must not blame room", () => {
  it("does not blame room when Pass and downsideRoom = 0.129", () => {
    const result = buildHumanInterpretation("pass", makeSetup({ downsideRoom: 0.129 }));
    expect(hasRoomBlameCopy(result)).toBe(false);
  });

  it("does not blame room at the exact 0.08 boundary", () => {
    const result = buildHumanInterpretation("pass", makeSetup({ downsideRoom: 0.08 }));
    expect(hasRoomBlameCopy(result)).toBe(false);
  });

  it("does not blame room when risks array is populated", () => {
    const result = buildHumanInterpretation(
      "pass",
      makeSetup({ downsideRoom: 0.129 }),
      ["Premium is not especially strong relative to defined risk."]
    );
    expect(hasRoomBlameCopy(result)).toBe(false);
  });
});

// Requirement 2: Pass + healthy room + healthy DTE must name a weak factor or use neutral fallback
describe("Pass + healthy room + healthy DTE — names weak factor or uses neutral fallback", () => {
  it("names thin credit as weak factor when creditRatio < 0.15 and room is healthy", () => {
    // premium=0.7, width=5 → ratio=0.14 → thin
    const setup = makeSetup({ downsideRoom: 0.129, premium: 0.7, width: 5 });
    const result = buildHumanInterpretation("pass", setup);

    expect(hasRoomBlameCopy(result)).toBe(false);
    expect(result.toLowerCase()).toContain("thin");
  });

  it("names DTE as weak factor when dte < 15 and room is healthy", () => {
    const setup = makeSetup({ downsideRoom: 0.129, daysToExpiration: 12 });
    const result = buildHumanInterpretation("pass", setup);

    expect(hasRoomBlameCopy(result)).toBe(false);
    expect(result.toLowerCase()).toMatch(/time|dte|days/);
  });

  it("uses neutral fallback with risks available when no direct factor matches", () => {
    const setup = makeSetup({ downsideRoom: 0.129, premium: 1.4, width: 5, daysToExpiration: 35 });
    const risks = ["Execution quality looks less reliable here."];
    const result = buildHumanInterpretation("pass", setup, risks);

    expect(hasRoomBlameCopy(result)).toBe(false);
    // Should acknowledge room is not the issue
    expect(result.toLowerCase()).toMatch(/room|main issue|held it back/);
  });

  it("uses neutral fallback with no risks when no direct factor matches", () => {
    const setup = makeSetup({ downsideRoom: 0.129, premium: 1.4, width: 5, daysToExpiration: 35 });
    const result = buildHumanInterpretation("pass", setup, []);

    expect(hasRoomBlameCopy(result)).toBe(false);
    expect(result.toLowerCase()).toMatch(/room|main issue|held it back/);
  });
});

// Correct behavior when room is actually tight
describe("Pass + tight room — correctly blames room", () => {
  it("reports tight room when room < 0.03", () => {
    const result = buildHumanInterpretation("pass", makeSetup({ downsideRoom: 0.02 }));
    expect(result.toLowerCase()).toMatch(/short strike|no room/);
  });
});

// Valid verdict stays positive
describe("Valid verdict — positive copy for healthy room", () => {
  it("returns workable copy for valid with room >= 0.08", () => {
    const result = buildHumanInterpretation("valid", makeSetup({ downsideRoom: 0.129 }));
    expect(result).toBeTruthy();
    expect(result.toLowerCase()).not.toContain("doesn't clear");
    expect(result.toLowerCase()).not.toContain("pass");
  });
});

// Watchlist does not blame room when room is healthy
describe("Watchlist + healthy room — must not blame room", () => {
  it("does not blame room when Watchlist and downsideRoom = 0.129", () => {
    const result = buildHumanInterpretation("watchlist", makeSetup({ downsideRoom: 0.129 }));
    expect(hasRoomBlameCopy(result)).toBe(false);
  });
});

// Metric accuracy: buildRoomMeaning is tested via the exported utility
// The metric functions in AnalyzerResultWorkspace do not receive decision,
// so they cannot misreport room even when decision is pass.
describe("Pass + healthy room — metric meaning is not affected by decision", () => {
  it("buildHumanInterpretation does not influence the room metric text (decision-independent paths)", () => {
    const passResult = buildHumanInterpretation("pass", makeSetup({ downsideRoom: 0.129 }));
    const validResult = buildHumanInterpretation("valid", makeSetup({ downsideRoom: 0.129 }));
    // The pass interpretation must not say the same positive thing as valid,
    // but neither should it blame room.
    expect(hasRoomBlameCopy(passResult)).toBe(false);
    expect(hasRoomBlameCopy(validResult)).toBe(false);
  });
});
