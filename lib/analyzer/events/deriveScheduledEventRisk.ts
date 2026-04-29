import type { EventRisk } from "@/types/analysis";
import type { EventSourceQuality } from "@/lib/market-data/types";

interface DeriveScheduledEventRiskInput {
  nextEarningsDate: string | null;
  eventSourceQuality: EventSourceQuality;
  fallbackRisk: EventRisk;
}

function daysUntil(dateText: string): number | null {
  const target = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const start = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  return Math.ceil((target.getTime() - start) / (1000 * 60 * 60 * 24));
}

export function deriveScheduledEventRisk({
  nextEarningsDate,
  eventSourceQuality,
  fallbackRisk,
}: DeriveScheduledEventRiskInput): EventRisk {
  if (eventSourceQuality === "limited") {
    return fallbackRisk;
  }

  if (!nextEarningsDate) {
    return fallbackRisk;
  }

  const days = daysUntil(nextEarningsDate);
  if (days == null) {
    return fallbackRisk;
  }

  if (days <= 7) return "high";
  if (days <= 21) return "medium";
  return "low";
}
