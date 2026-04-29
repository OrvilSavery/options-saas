import { describe, expect, it } from "vitest";
import { buildExactRequestedCreditSpread } from "@/lib/analyzer/exact-review/buildExactRequestedCreditSpread";
import { futureDate, makeOptionRow } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

describe("buildExactRequestedCreditSpread", () => {
  it("calculates put credit spread math from exact option legs", () => {
    const expiration = futureDate(35);
    const result = buildExactRequestedCreditSpread({
      ticker: "SPY",
      underlyingPrice: 550,
      strategyType: "put_credit_spread",
      expiration,
      shortStrike: 525,
      longStrike: 520,
      expectedMoveLow: 530,
      expectedMoveHigh: 570,
      optionRows: [
        makeOptionRow({ symbol: "SPY-short", expiration, strike: 525, bid: 1.5, ask: 1.7, delta: -0.18 }),
        makeOptionRow({ symbol: "SPY-long", expiration, strike: 520, bid: 0.45, ask: 0.55, delta: -0.1 }),
      ],
    });

    expect(result).not.toBeNull();
    expect(result?.width).toBe(5);
    expect(result?.netCredit).toBe(1.1);
    expect(result?.maxLoss).toBe(3.9);
    expect(result?.returnOnRisk).toBe(0.28);
    expect(result?.creditPctWidth).toBe(22);
    expect(result?.maxLossRatio).toBe(3.55);
    expect(result?.bidAskPct).toBe(27.27);
    expect(result?.outsideExpectedMove).toBe(true);
  });

  it("returns null when either requested leg is missing", () => {
    const expiration = futureDate(35);
    const result = buildExactRequestedCreditSpread({
      ticker: "SPY",
      underlyingPrice: 550,
      strategyType: "put_credit_spread",
      expiration,
      shortStrike: 525,
      longStrike: 520,
      optionRows: [makeOptionRow({ expiration, strike: 525 })],
    });

    expect(result).toBeNull();
  });

  it("returns null when exact legs do not produce a net credit", () => {
    const expiration = futureDate(35);
    const result = buildExactRequestedCreditSpread({
      ticker: "SPY",
      underlyingPrice: 550,
      strategyType: "put_credit_spread",
      expiration,
      shortStrike: 525,
      longStrike: 520,
      optionRows: [
        makeOptionRow({ expiration, strike: 525, bid: 0.5, ask: 0.6 }),
        makeOptionRow({ expiration, strike: 520, bid: 0.7, ask: 0.8 }),
      ],
    });

    expect(result).toBeNull();
  });
});
