import type { Decision, EventRisk, EventRiskSeverity, EventRiskSource } from "@/types/analysis";
import type {
  ImpliedVolatilityLabel,
  RawOptionsCandidate,
} from "@/lib/market-data/types";

export type SeededScheduledEventType =
  | "earnings"
  | "fomc"
  | "cpi"
  | "pce"
  | "dividend"
  | "sector"
  | "macro"
  | "other";

export interface SeededScheduledEvent {
  id?: string | null;
  type: SeededScheduledEventType;
  label?: string | null;
  date: string;
  severity?: EventRiskSeverity | null;
  explanation?: string | null;
  source?: EventRiskSource | null;
}

export interface SeededAnalyzerInput {
  ticker: string;
  underlyingPrice: number;

  marketContext: {
    summary: string;
  };

  volatilityContext: {
    summary: string;
    impliedVolatilityLabel: ImpliedVolatilityLabel;
  };

  expectedMoveContext: {
    expectedMoveLow: number | null;
    expectedMoveHigh: number | null;
  };

  eventContext: {
    risk: EventRisk;
    nextEarningsDate?: string | null;
    eventSourceQuality?: string | null;
    scheduledEvents?: SeededScheduledEvent[];
  };

  decisionContext: {
    decision: Decision;
    risks: string[];
  };

  candidateStrategies: RawOptionsCandidate[];
}
