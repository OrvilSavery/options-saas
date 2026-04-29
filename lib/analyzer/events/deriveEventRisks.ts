import type { EventRiskFlag, EventRiskSeverity } from "@/types/analysis";
import type {
  AnalyzerInput,
  AnalyzerScheduledEvent,
  AnalyzerStrategyCandidate,
} from "@/lib/analyzer/input/types";

interface DeriveEventRisksInput {
  input: AnalyzerInput;
  selectedCandidate: AnalyzerStrategyCandidate | null;
  asOf?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const BROAD_ETF_TICKERS = new Set([
  "SPY",
  "QQQ",
  "IWM",
  "DIA",
  "TLT",
  "IEF",
  "HYG",
  "LQD",
  "XLF",
  "XLK",
  "XLE",
  "XLV",
  "XLY",
  "XLP",
  "XLI",
  "XLB",
  "XLU",
  "XLRE",
]);

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime()) / DAY_MS);
}

function pluralizeDays(days: number): string {
  return `${days} day${days === 1 ? "" : "s"}`;
}

function severityRank(severity: EventRiskSeverity): number {
  if (severity === "danger") return 0;
  if (severity === "warning") return 1;
  return 2;
}

function eventTypeLabel(event: AnalyzerScheduledEvent): string {
  if (event.label) return event.label;

  switch (event.type) {
    case "earnings":
      return "Earnings";
    case "fomc":
      return "FOMC meeting";
    case "cpi":
      return "CPI release";
    case "pce":
      return "PCE release";
    case "dividend":
      return "Dividend date";
    case "sector":
      return "Sector event";
    case "macro":
      return "Macro event";
    default:
      return "Scheduled event";
  }
}

function normalizeScheduledSeverity(
  event: AnalyzerScheduledEvent,
  daysUntilEvent: number,
  setupDte: number | null
): EventRiskSeverity {
  if (event.severity) return event.severity;

  if (event.type === "earnings") return "danger";
  if (event.type === "dividend") return "warning";
  if (setupDte != null && daysUntilEvent >= 0 && daysUntilEvent <= setupDte) {
    return "warning";
  }

  return "info";
}

function buildScheduledEventFlag({
  event,
  daysUntilEvent,
  setupDte,
}: {
  event: AnalyzerScheduledEvent;
  daysUntilEvent: number;
  setupDte: number | null;
}): EventRiskFlag {
  const label = eventTypeLabel(event);
  const occursBeforeExpiration =
    setupDte != null && daysUntilEvent >= 0 && daysUntilEvent <= setupDte;

  return {
    id: event.id ?? `${event.type}-${event.date}`,
    label: occursBeforeExpiration
      ? `${label} occurs before expiration.`
      : `${label} is near the review window.`,
    severity: normalizeScheduledSeverity(event, daysUntilEvent, setupDte),
    timing:
      daysUntilEvent >= 0
        ? `${pluralizeDays(daysUntilEvent)} from now`
        : "Date has passed",
    explanation:
      event.explanation ??
      (occursBeforeExpiration
        ? "This is a scheduled event inside the setup window. It should be checked before entering a premium-selling position."
        : "This scheduled event is close enough to the setup window that it is worth checking before entry."),
    source: event.source ?? "calendar",
  };
}

function buildEarningsFlag({
  selectedCandidate,
  nextEarningsDate,
  asOf,
}: {
  selectedCandidate: AnalyzerStrategyCandidate;
  nextEarningsDate: string | null | undefined;
  asOf: Date;
}): EventRiskFlag | null {
  if (selectedCandidate.earningsInWindow) {
    return {
      id: "earnings-inside-expiration-window",
      label: "Earnings fall before expiration.",
      severity: "danger",
      timing: "Before expiration",
      explanation:
        "Premium-selling setups can be exposed to larger price moves around earnings. This should be treated as a major event check before entry.",
      source: "calendar",
    };
  }

  if (
    selectedCandidate.earningsDaysAfter != null &&
    selectedCandidate.earningsDaysAfter >= 0 &&
    selectedCandidate.earningsDaysAfter <= 7
  ) {
    return {
      id: "earnings-shortly-after-expiration",
      label: `Earnings are ${pluralizeDays(selectedCandidate.earningsDaysAfter)} after expiration.`,
      severity: "warning",
      timing: "Shortly after expiration",
      explanation:
        "Even when earnings are after expiration, the upcoming event can affect implied volatility and price behavior during the setup window.",
      source: "calendar",
    };
  }

  const parsedEarningsDate = parseDate(nextEarningsDate);
  if (!parsedEarningsDate || selectedCandidate.daysToExpiration == null) {
    return null;
  }

  const daysUntilEarnings = daysBetween(asOf, parsedEarningsDate);

  if (daysUntilEarnings >= 0 && daysUntilEarnings <= selectedCandidate.daysToExpiration) {
    return {
      id: "earnings-inside-expiration-window",
      label: "Earnings fall before expiration.",
      severity: "danger",
      timing: `${pluralizeDays(daysUntilEarnings)} from now`,
      explanation:
        "The setup window includes earnings. This can materially change the risk profile of a short-premium trade.",
      source: "calendar",
    };
  }

  const daysAfterExpiration = daysUntilEarnings - selectedCandidate.daysToExpiration;
  if (daysAfterExpiration >= 0 && daysAfterExpiration <= 7) {
    return {
      id: "earnings-shortly-after-expiration",
      label: `Earnings are ${pluralizeDays(daysAfterExpiration)} after expiration.`,
      severity: "warning",
      timing: `${pluralizeDays(daysUntilEarnings)} from now`,
      explanation:
        "The event is just outside the setup window, so volatility and positioning can still matter before expiration.",
      source: "calendar",
    };
  }

  return null;
}

function buildBroadEtfFlag(ticker: string): EventRiskFlag | null {
  const normalizedTicker = ticker.trim().toUpperCase();
  if (!BROAD_ETF_TICKERS.has(normalizedTicker)) return null;

  return {
    id: "broad-etf-macro-sensitivity",
    label: "Broad market ETF: check macro calendar risk.",
    severity: "info",
    explanation:
      "This ticker can be sensitive to scheduled macro releases and policy events. No prediction is made here; it is a reminder to check the calendar before entry.",
    source: "market",
  };
}

function buildFallbackRiskFlag(input: AnalyzerInput): EventRiskFlag | null {
  if (input.eventContext.risk === "high") {
    return {
      id: "legacy-event-risk-high",
      label: "Event risk is elevated in the current review window.",
      severity: "danger",
      explanation:
        "The current analyzer inputs indicate elevated event pressure, but a more specific event record was not available for this review.",
      source: input.eventContext.eventSourceQuality === "mock" ? "mock" : "unknown",
    };
  }

  if (input.eventContext.risk === "medium") {
    return {
      id: "legacy-event-risk-medium",
      label: "Event risk is worth checking before entry.",
      severity: "warning",
      explanation:
        "The current analyzer inputs indicate some event pressure, but a more specific event record was not available for this review.",
      source: input.eventContext.eventSourceQuality === "mock" ? "mock" : "unknown",
    };
  }

  return null;
}

function dedupeFlags(flags: EventRiskFlag[]): EventRiskFlag[] {
  const seen = new Set<string>();
  const results: EventRiskFlag[] = [];

  for (const flag of flags) {
    if (seen.has(flag.id)) continue;
    seen.add(flag.id);
    results.push(flag);
  }

  return results.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

export function deriveEventRisks({
  input,
  selectedCandidate,
  asOf = new Date(),
}: DeriveEventRisksInput): EventRiskFlag[] {
  const flags: EventRiskFlag[] = [];
  const setupDte = selectedCandidate?.daysToExpiration ?? null;

  if (selectedCandidate) {
    const earningsFlag = buildEarningsFlag({
      selectedCandidate,
      nextEarningsDate: input.eventContext.nextEarningsDate,
      asOf,
    });
    if (earningsFlag) flags.push(earningsFlag);
  }

  for (const event of input.eventContext.scheduledEvents ?? []) {
    const parsedDate = parseDate(event.date);
    if (!parsedDate) continue;

    const daysUntilEvent = daysBetween(asOf, parsedDate);
    const isInWindow = setupDte != null && daysUntilEvent >= 0 && daysUntilEvent <= setupDte;
    const isNearWindow = setupDte != null && daysUntilEvent > setupDte && daysUntilEvent <= setupDte + 7;

    if (isInWindow || isNearWindow || event.type === "macro" || event.type === "sector") {
      flags.push(buildScheduledEventFlag({ event, daysUntilEvent, setupDte }));
    }
  }

  const broadEtfFlag = buildBroadEtfFlag(input.ticker);
  if (broadEtfFlag) flags.push(broadEtfFlag);

  const fallbackRiskFlag = buildFallbackRiskFlag(input);
  if (fallbackRiskFlag) flags.push(fallbackRiskFlag);

  return dedupeFlags(flags).slice(0, 5);
}
