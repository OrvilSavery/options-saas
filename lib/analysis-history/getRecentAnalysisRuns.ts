import { supabaseAdmin } from "@/lib/db";

export interface RecentAnalysisRun {
  id: string;
  ticker: string;
  decision: "valid" | "watchlist" | "pass";
  event_risk: "low" | "medium" | "high";
  price: number;
  strategy_type: string | null;
  best_strategy_label: string | null;
  created_at: string;
}

export async function getRecentAnalysisRuns(userId: string, limit = 5) {
  const { data, error } = await supabaseAdmin
    .from("analysis_runs")
    .select(
      "id, ticker, decision, event_risk, price, strategy_type, best_strategy_label, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load recent analysis runs: ${error.message}`);
  }

  return (data ?? []) as RecentAnalysisRun[];
}