import type { AnalysisMetadata, DataQualityFlag, ReviewCoverageItem } from "@/types/analysis";
import type { AnalyzerInput, AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";

const DEFAULT_EXPLORE_WINDOW = {
  preferredDteMin: 21,
  preferredDteMax: 45,
  hardDteMin: 7,
  hardDteMax: 60,
  maxExpirationsChecked: 4,
};

function getConfiguredDataSource(): AnalysisMetadata["dataSource"] {
  const provider =
    process.env.MARKET_DATA_PROVIDER ??
    process.env.NEXT_PUBLIC_MARKET_DATA_PROVIDER ??
    process.env.OPTIONS_MARKET_DATA_PROVIDER ??
    "mock";

  if (provider.toLowerCase().includes("finnhub") || provider.toLowerCase().includes("tradier")) {
    return "live";
  }

  if (provider.toLowerCase().includes("mock") || provider.toLowerCase().includes("seed")) {
    return "mock";
  }

  return "unknown";
}

function getEasternParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    weekday: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function getMarketSession(date: Date): Pick<AnalysisMetadata, "marketSession" | "marketSessionLabel"> {
  const { weekday, hour, minute } = getEasternParts(date);
  const minutes = hour * 60 + minute;
  const isWeekend = weekday === "Sat" || weekday === "Sun";

  if (isWeekend) {
    return { marketSession: "market_closed", marketSessionLabel: "Market closed" };
  }

  if (minutes >= 9 * 60 + 30 && minutes < 16 * 60) {
    return { marketSession: "market_open", marketSessionLabel: "Market open" };
  }

  if (minutes >= 4 * 60 && minutes < 9 * 60 + 30) {
    return { marketSession: "pre_market", marketSessionLabel: "Pre-market" };
  }

  if (minutes >= 16 * 60 && minutes < 20 * 60) {
    return { marketSession: "after_hours", marketSessionLabel: "After-hours" };
  }

  return { marketSession: "market_closed", marketSessionLabel: "Market closed" };
}

function getQuoteStatus(dataSource: AnalysisMetadata["dataSource"]): Pick<AnalysisMetadata, "quoteStatus" | "quoteStatusLabel" | "dataSourceLabel"> {
  if (dataSource === "mock") {
    return {
      quoteStatus: "mock",
      quoteStatusLabel: "Demo data",
      dataSourceLabel: "Demo data",
    };
  }

  if (dataSource === "live") {
    return {
      quoteStatus: "last_available",
      quoteStatusLabel: "Latest available quote",
      dataSourceLabel: "Live data source",
    };
  }

  return {
    quoteStatus: "unknown",
    quoteStatusLabel: "Quote source not labeled",
    dataSourceLabel: "Unknown data source",
  };
}

function hasExecutionDepth(candidate: AnalyzerStrategyCandidate | null): boolean {
  if (!candidate) return false;
  return (
    candidate.shortLegVolume != null ||
    candidate.longLegVolume != null ||
    candidate.shortLegOpenInterest != null ||
    candidate.longLegOpenInterest != null ||
    candidate.bidAskPct != null ||
    candidate.shortLegBidAskWidth != null ||
    candidate.longLegBidAskWidth != null
  );
}

function buildDataQualityFlags({
  input,
  selectedCandidate,
  dataSource,
}: {
  input: AnalyzerInput;
  selectedCandidate: AnalyzerStrategyCandidate | null;
  dataSource: AnalysisMetadata["dataSource"];
}): DataQualityFlag[] {
  const flags: DataQualityFlag[] = [];

  if (dataSource !== "live") {
    flags.push({
      id: "demo-or-unlabeled-source",
      label: dataSource === "mock" ? "Demo data is active" : "Data source is not fully labeled",
      severity: dataSource === "mock" ? "info" : "warning",
      explanation:
        dataSource === "mock"
          ? "This review is using seeded/demo market data. Treat values as workflow examples until live provider data is enabled."
          : "The analyzer could not label the market-data source for this run.",
    });
  }

  if (!selectedCandidate) {
    flags.push({
      id: "no-selected-candidate",
      label: "No setup cleared the review rules",
      severity: "info",
      explanation: "The analyzer did not select an active setup to review from the current candidate set.",
    });
    return flags;
  }

  if (selectedCandidate.ivRank == null || selectedCandidate.ivHvRatio == null) {
    flags.push({
      id: "volatility-inputs-partial",
      label: "Volatility inputs are partial",
      severity: "info",
      explanation: "IV rank or IV/HV ratio is not available for this setup, so volatility context may be simplified.",
    });
  }

  if (!hasExecutionDepth(selectedCandidate)) {
    flags.push({
      id: "execution-depth-partial",
      label: "Execution depth is limited",
      severity: "info",
      explanation: "Volume, open interest, or bid/ask detail is incomplete for this setup.",
    });
  }

  if (input.eventContext.eventSourceQuality === "mock") {
    flags.push({
      id: "event-data-demo",
      label: "Event coverage uses demo inputs",
      severity: "info",
      explanation: "Known-event checks are based on analyzer-provided context, not a full live headline feed.",
    });
  }

  return flags.slice(0, 4);
}

function buildDataQuality({ flags }: { flags: DataQualityFlag[] }): NonNullable<AnalysisMetadata["dataQuality"]> {
  const hasWarning = flags.some((flag) => flag.severity === "warning");

  if (hasWarning) {
    return { status: "limited", label: "Limited", flags };
  }

  if (flags.length > 0) {
    return { status: "partial", label: "Partial", flags };
  }

  return { status: "good", label: "Good", flags };
}

function buildEventCoverage(input: AnalyzerInput, selectedCandidate: AnalyzerStrategyCandidate | null): ReviewCoverageItem[] {
  const hasScheduledEvents = (input.eventContext.scheduledEvents ?? []).length > 0;
  const hasEarnings = Boolean(input.eventContext.nextEarningsDate) || Boolean(selectedCandidate?.earningsInWindow) || selectedCandidate?.earningsDaysAfter != null;

  return [
    {
      id: "earnings",
      label: "Earnings",
      status: hasEarnings ? "checked" : "limited",
      explanation: hasEarnings ? "Earnings timing was available for this review." : "No specific earnings date was available in the analyzer inputs.",
    },
    {
      id: "macro-calendar",
      label: "Macro calendar",
      status: hasScheduledEvents ? "checked" : "limited",
      explanation: hasScheduledEvents ? "Scheduled macro or event records were available for this review." : "No specific CPI, PCE, or FOMC records were available for this review.",
    },
    {
      id: "dividend-assignment",
      label: "Dividend / assignment risk",
      status: hasScheduledEvents ? "checked" : "limited",
      explanation: "Checked when dividend or assignment-relevant data is available for this review.",
    },
    {
      id: "broad-market-sensitivity",
      label: "Broad market sensitivity",
      status: "checked",
      explanation: "Broad ETF and market-sensitive ticker reminders are handled deterministically.",
    },
    {
      id: "live-news",
      label: "Live news headlines",
      status: "not_included",
      explanation: "Unscheduled headlines and analyst notes are not included in this review.",
    },
  ];
}

export function buildAnalysisMetadata({
  input,
  selectedCandidate,
  isExactReview,
  screenedExpirationCount,
  noCleanSetup,
  asOf = new Date(),
}: {
  input: AnalyzerInput;
  selectedCandidate: AnalyzerStrategyCandidate | null;
  isExactReview: boolean;
  screenedExpirationCount: number | null;
  noCleanSetup: boolean;
  asOf?: Date;
}): AnalysisMetadata {
  const dataSource = getConfiguredDataSource();
  const marketSession = getMarketSession(asOf);
  const quoteStatus = getQuoteStatus(dataSource);
  const dataQualityFlags = buildDataQualityFlags({ input, selectedCandidate, dataSource });

  const reviewScope = isExactReview
    ? {
        modeLabel: "Review your setup" as const,
        summary: "Reviewed the exact expiration and strikes you entered.",
        expirationWindowLabel: selectedCandidate?.expiration ?? undefined,
      }
    : {
        modeLabel: "Find setups" as const,
        summary: "Screened near-term expirations and showed the strongest setup worth reviewing.",
        expirationWindowLabel: `${DEFAULT_EXPLORE_WINDOW.hardDteMin}–${DEFAULT_EXPLORE_WINDOW.hardDteMax} DTE screened`,
        preferredWindowLabel: `${DEFAULT_EXPLORE_WINDOW.preferredDteMin}–${DEFAULT_EXPLORE_WINDOW.preferredDteMax} DTE preferred`,
        screenedExpirationCount,
      };

  return {
    analyzedAt: asOf.toISOString(),
    marketDataAsOf: null,
    optionsDataAsOf: null,
    dataSource,
    ...quoteStatus,
    ...marketSession,
    reviewScope,
    dataQuality: buildDataQuality({ flags: dataQualityFlags }),
    eventCoverage: buildEventCoverage(input, selectedCandidate),
    exploreContext: !isExactReview
      ? {
          ...DEFAULT_EXPLORE_WINDOW,
          screenedExpirationCount,
          noCleanSetup,
        }
      : undefined,
  };
}
