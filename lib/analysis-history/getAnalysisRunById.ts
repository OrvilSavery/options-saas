import { supabaseAdmin } from "@/lib/db";
import type { FullAnalysisRun } from "@/lib/analysis-history/getAllAnalysisRuns";

export async function getAnalysisRunById(userId: string, runId: string) {
  const { data, error } = await supabaseAdmin
    .from("analysis_runs")
    .select(
      "id, ticker, decision, event_risk, price, strategy_type, best_strategy_label, analysis_payload, created_at"
    )
    .eq("user_id", userId)
    .eq("id", runId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load analysis run: ${error.message}`);
  }

  return (data ?? null) as FullAnalysisRun | null;
}