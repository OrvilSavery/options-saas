import { describe, expect, it } from "vitest";
import { deriveEventRisks } from "@/lib/analyzer/events/deriveEventRisks";
import { makeAnalyzerInput, makeCandidate } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

const AS_OF = new Date("2026-04-01T12:00:00Z");

describe("deriveEventRisks", () => {
  it("flags earnings inside the expiration window as danger", () => {
    const selectedCandidate = makeCandidate({
      daysToExpiration: 20,
      earningsInWindow: true,
    });
    const input = makeAnalyzerInput({}, selectedCandidate);

    const flags = deriveEventRisks({ input, selectedCandidate, asOf: AS_OF });

    expect(flags.some((flag) => flag.id === "earnings-inside-expiration-window")).toBe(true);
    expect(flags.find((flag) => flag.id === "earnings-inside-expiration-window")?.severity).toBe("danger");
  });

  it("flags earnings shortly after expiration as warning", () => {
    const selectedCandidate = makeCandidate({
      daysToExpiration: 20,
      earningsInWindow: false,
      earningsDaysAfter: 4,
    });
    const input = makeAnalyzerInput({}, selectedCandidate);

    const flags = deriveEventRisks({ input, selectedCandidate, asOf: AS_OF });

    expect(flags.some((flag) => flag.id === "earnings-shortly-after-expiration")).toBe(true);
    expect(flags.find((flag) => flag.id === "earnings-shortly-after-expiration")?.severity).toBe("warning");
  });

  it("surfaces scheduled macro events without using AI or headline guesses", () => {
    const selectedCandidate = makeCandidate({ daysToExpiration: 20 });
    const input = makeAnalyzerInput({
      eventContext: {
        risk: "low",
        nextEarningsDate: null,
        eventSourceQuality: "mock",
        scheduledEvents: [
          {
            id: "cpi-2026-04-10",
            type: "cpi",
            label: "CPI release",
            date: "2026-04-10",
            source: "calendar",
          },
        ],
      },
    });

    const flags = deriveEventRisks({ input, selectedCandidate, asOf: AS_OF });

    expect(flags.some((flag) => flag.id === "cpi-2026-04-10")).toBe(true);
    expect(flags.find((flag) => flag.id === "cpi-2026-04-10")?.source).toBe("calendar");
  });

  it("adds broad ETF macro reminder for SPY", () => {
    const selectedCandidate = makeCandidate();
    const input = makeAnalyzerInput({ ticker: "SPY" });

    const flags = deriveEventRisks({ input, selectedCandidate, asOf: AS_OF });

    expect(flags.some((flag) => flag.id === "broad-etf-macro-sensitivity")).toBe(true);
  });
});
