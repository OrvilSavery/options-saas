import type { AnalyzerInput } from "@/lib/analyzer/input/types";
import { deriveScheduledEventRisk } from "@/lib/analyzer/events/deriveScheduledEventRisk";
import type { EventRisk } from "@/types/analysis";
import type { EventSourceQuality } from "@/lib/market-data/types";

function normalizeEventSourceQuality(value: string | null | undefined): EventSourceQuality {
  if (value === "mock" || value === "live" || value === "limited" || value === "unknown") {
    return value;
  }

  return "unknown";
}

export function assessEventRisk(input: AnalyzerInput): EventRisk {
  return deriveScheduledEventRisk({
    nextEarningsDate: input.eventContext.nextEarningsDate ?? null,
    eventSourceQuality: normalizeEventSourceQuality(input.eventContext.eventSourceQuality),
    fallbackRisk: input.eventContext.risk,
  });
}
