import { supabaseAdmin } from "@/lib/db";

export async function deleteAnalysisRun(userId: string, runId: string) {
  const { error } = await supabaseAdmin
    .from("analysis_runs")
    .delete()
    .eq("user_id", userId)
    .eq("id", runId);

  if (error) {
    throw new Error(`Failed to delete analysis run: ${error.message}`);
  }
}