import type { AnalyzeRequest } from "@/lib/analyzer/types/analyzeRequest";
import type { RequestedStrategyType } from "@/lib/analyzer/entry/types";
import type { AnalyzerReopenState } from "@/lib/analyzer/reopen/types";

function normalizeExpiration(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // MM/DD/YYYY — browser locale display format that can end up in URL params
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return `${slashMatch[3]}-${slashMatch[1].padStart(2, "0")}-${slashMatch[2].padStart(2, "0")}`;
  }

  return trimmed;
}

function normalizeStrategyType(
  raw: string | null | undefined
): RequestedStrategyType | null {
  if (!raw) return null;

  const value = raw.trim().toLowerCase();
  if (!value) return null;

  if (value === "put_credit_spread" || value === "put credit spread") {
    return "put_credit_spread";
  }

  if (value === "call_credit_spread" || value === "call credit spread") {
    return "call_credit_spread";
  }

  return null;
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasExactSetupFields(state: {
  strategyType: RequestedStrategyType | null;
  expiration: string | null;
  shortStrike: number | null;
  longStrike: number | null;
}) {
  return Boolean(
    state.strategyType &&
      state.expiration &&
      state.shortStrike != null &&
      state.longStrike != null
  );
}

function normalizeMode(value: string | null): "explore" | "review" | null {
  if (value === "explore" || value === "review") return value;
  return null;
}

function resolveInitialMode(input: {
  explicitMode: "explore" | "review" | null;
  strategyType: RequestedStrategyType | null;
  expiration: string | null;
  shortStrike: number | null;
  longStrike: number | null;
}) {
  const inferredReview = hasExactSetupFields(input);

  if (input.explicitMode === "review" && inferredReview) return "review";
  if (input.explicitMode === "explore") return "explore";

  return inferredReview ? "review" : "explore";
}

export function buildAnalyzerInitialState(
  params: URLSearchParams
): AnalyzerReopenState {
  const ticker = (params.get("ticker") ?? "").trim().toUpperCase();
  const strategyType = normalizeStrategyType(
    params.get("strategyType") ?? params.get("strategy")
  );
  const expiration = normalizeExpiration(params.get("expiration"));
  const shortStrike = parseNumber(params.get("shortStrike"));
  const longStrike = parseNumber(params.get("longStrike"));
  const explicitMode = normalizeMode(params.get("mode"));

  const mode = resolveInitialMode({
    explicitMode,
    strategyType,
    expiration,
    shortStrike,
    longStrike,
  });

  return {
    ticker,
    mode,
    strategyType,
    expiration,
    shortStrike,
    longStrike,
    autorun: params.get("autorun") === "1" && Boolean(ticker),
  };
}

export function buildAnalyzeRequestFromReopenState(
  state: AnalyzerReopenState
): AnalyzeRequest {
  const strategyType = normalizeStrategyType(state.strategyType);

  return {
    ticker: state.ticker,
    mode: state.mode,
    strategyType,
    expiration: state.expiration,
    shortStrike: state.shortStrike,
    longStrike: state.longStrike,
  };
}
