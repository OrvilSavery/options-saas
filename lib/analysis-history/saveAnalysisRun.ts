import { supabaseAdmin } from "@/lib/db";
import type { AnalysisResponse } from "@/types/analysis";

interface SaveAnalysisRunInput {
  userId: string;
  analysis: AnalysisResponse;
}

export async function saveAnalysisRun({
  userId,
  analysis,
}: SaveAnalysisRunInput) {
  const { error } = await supabaseAdmin.from("analysis_runs").insert({
    user_id: userId,
    ticker: analysis.ticker.toUpperCase(),
    decision: analysis.decision,
    event_risk: analysis.eventRisk,
    price: analysis.price,
    strategy_type: analysis.bestStrategy?.strategy ?? null,
    best_strategy_label: analysis.bestStrategy?.setupLabel ?? null,
    analysis_payload: analysis,
  });

  if (error) {
    throw new Error(`Failed to save analysis run: ${error.message}`);
  }
}