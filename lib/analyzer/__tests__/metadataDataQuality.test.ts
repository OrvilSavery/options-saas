import { describe, expect, it, vi } from "vitest";
import { buildAnalysisMetadata } from "@/lib/analyzer/metadata/buildAnalysisMetadata";
import { makeAnalyzerInput, makeCandidate } from "@/lib/analyzer/test-utils/creditSpreadFixtures";

const AS_OF = new Date("2026-04-01T14:00:00Z");

describe("buildAnalysisMetadata", () => {
  it("labels exact Review mode with the exact setup scope", () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "mock");
    const selectedCandidate = makeCandidate({ expiration: "2026-05-15" });
    const input = makeAnalyzerInput({}, selectedCandidate);

    const metadata = buildAnalysisMetadata({
      input,
      selectedCandidate,
      isExactReview: true,
      screenedExpirationCount: null,
      noCleanSetup: false,
      asOf: AS_OF,
    });

    expect(metadata.reviewScope?.modeLabel).toBe("Review your setup");
    expect(metadata.reviewScope?.summary).toContain("exact expiration and strikes");
    expect(metadata.exploreContext).toBeUndefined();
    vi.unstubAllEnvs();
  });

  it("labels Find setups with screened DTE window and no-clean-setup state", () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "mock");
    const input = makeAnalyzerInput({ candidateStrategies: [] });

    const metadata = buildAnalysisMetadata({
      input,
      selectedCandidate: null,
      isExactReview: false,
      screenedExpirationCount: 4,
      noCleanSetup: true,
      asOf: AS_OF,
    });

    expect(metadata.reviewScope?.modeLabel).toBe("Find setups");
    expect(metadata.reviewScope?.expirationWindowLabel).toBe("7–60 DTE screened");
    expect(metadata.exploreContext?.noCleanSetup).toBe(true);
    expect(metadata.exploreContext?.preferredDteMin).toBe(21);
    expect(metadata.exploreContext?.preferredDteMax).toBe(45);
    vi.unstubAllEnvs();
  });

  it("marks missing volatility inputs as partial data quality instead of pretending confidence", () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "mock");
    const selectedCandidate = makeCandidate({ ivRank: null, ivHvRatio: null });
    const input = makeAnalyzerInput({}, selectedCandidate);

    const metadata = buildAnalysisMetadata({
      input,
      selectedCandidate,
      isExactReview: true,
      screenedExpirationCount: null,
      noCleanSetup: false,
      asOf: AS_OF,
    });

    expect(metadata.dataQuality?.status).toBe("partial");
    expect(metadata.dataQuality?.flags.some((flag) => flag.id === "volatility-inputs-partial")).toBe(true);
    vi.unstubAllEnvs();
  });

  it("discloses demo data source clearly", () => {
    vi.stubEnv("MARKET_DATA_PROVIDER", "mock");
    const selectedCandidate = makeCandidate();
    const input = makeAnalyzerInput({}, selectedCandidate);

    const metadata = buildAnalysisMetadata({
      input,
      selectedCandidate,
      isExactReview: true,
      screenedExpirationCount: null,
      noCleanSetup: false,
      asOf: AS_OF,
    });

    expect(metadata.dataSource).toBe("mock");
    expect(metadata.quoteStatusLabel).toBe("Demo data");
    expect(metadata.dataQuality?.flags.some((flag) => flag.id === "demo-or-unlabeled-source")).toBe(true);
    vi.unstubAllEnvs();
  });
});
