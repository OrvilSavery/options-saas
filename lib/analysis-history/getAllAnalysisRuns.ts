import { supabaseAdmin } from "@/lib/db";

export interface FullAnalysisRun {
  id: string;
  ticker: string;
  decision: "valid" | "watchlist" | "pass";
  event_risk: "low" | "medium" | "high";
  price: number;
  strategy_type: string | null;
  best_strategy_label: string | null;
  analysis_payload: {
    ticker: string;
    price: number;
    marketCondition: string;
    volatilityCondition: string;
    eventRisk: "low" | "medium" | "high";
    decision: "valid" | "watchlist" | "pass";
    bestStrategy: {
      strategy: string;
      expiration: string;
      setupLabel: string;
      premium: number | null;
      returnOnRisk: number | null;
      whyTopRanked: string;
    } | null;
    saferAlternative: {
      setupLabel: string;
      note: string;
    } | null;
    aggressiveAlternative: {
      setupLabel: string;
      note: string;
    } | null;
    risks: string[];
    explanation: string;
  };
  created_at: string;
}

export interface AnalysisHistoryFilters {
  ticker?: string;
  decision?: "valid" | "watchlist" | "pass" | "";
}

export async function getAllAnalysisRuns(
  userId: string,
  filters: AnalysisHistoryFilters = {}
) {
  let query = supabaseAdmin
    .from("analysis_runs")
    .select(
      "id, ticker, decision, event_risk, price, strategy_type, best_strategy_label, analysis_payload, created_at",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const trimmedTicker = filters.ticker?.trim().toUpperCase() ?? "";
  const trimmedDecision = filters.decision?.trim() ?? "";

  if (trimmedTicker) {
    query = query.ilike("ticker", `%${trimmedTicker}%`);
  }

  if (
    trimmedDecision === "valid" ||
    trimmedDecision === "watchlist" ||
    trimmedDecision === "pass"
  ) {
    query = query.eq("decision", trimmedDecision);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to load analysis history: ${error.message}`);
  }

  return {
    runs: (data ?? []) as FullAnalysisRun[],
    totalCount: count ?? 0,
  };
}