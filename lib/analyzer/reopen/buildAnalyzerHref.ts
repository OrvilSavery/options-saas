import type { AnalyzerReopenState } from "@/lib/analyzer/reopen/types";

function normalizeStrategyType(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const value = raw.trim().toLowerCase();
  if (!value) return null;

  if (value === "put credit spread") return "put_credit_spread";
  if (value === "call credit spread") return "call_credit_spread";

  return value;
}

function hasReviewableSetupFields(state: {
  strategyType: string | null;
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

function resolveReopenMode(state: AnalyzerReopenState, strategyType: string | null) {
  const requestedMode =
    state.mode === "review" || state.mode === "explore" ? state.mode : null;

  const inferredReview = hasReviewableSetupFields({
    strategyType,
    expiration: state.expiration ?? null,
    shortStrike: state.shortStrike ?? null,
    longStrike: state.longStrike ?? null,
  });

  if (requestedMode === "review" && inferredReview) return "review";
  if (requestedMode === "explore") return "explore";

  return inferredReview ? "review" : "explore";
}

export function buildAnalyzerHref(state: AnalyzerReopenState) {
  const params = new URLSearchParams();
  const strategyType = normalizeStrategyType(state.strategyType);
  const mode = resolveReopenMode(state, strategyType);

  if (state.ticker) {
    params.set("ticker", state.ticker.trim().toUpperCase());
  }

  if (strategyType) {
    params.set("strategyType", strategyType);
    params.set("strategy", strategyType);
  }

  if (state.expiration) {
    params.set("expiration", state.expiration);
  }

  if (state.shortStrike != null) {
    params.set("shortStrike", String(state.shortStrike));
  }

  if (state.longStrike != null) {
    params.set("longStrike", String(state.longStrike));
  }

  params.set("mode", mode);

  if (state.autorun) {
    params.set("autorun", "1");
  }

  return `/analyzer?${params.toString()}`;
}
