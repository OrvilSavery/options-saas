import { NextResponse } from "next/server";
import { ensureUserRecord } from "@/lib/auth";
import { getAllAnalysisRuns } from "@/lib/analysis-history/getAllAnalysisRuns";

export async function GET() {
  try {
    const user = await ensureUserRecord();
    if (!user) {
      return NextResponse.json({ runs: [] });
    }

    const result = await getAllAnalysisRuns(user.id);
    return NextResponse.json({
      runs: Array.isArray(result?.runs) ? result.runs : [],
      totalCount: typeof result?.totalCount === "number" ? result.totalCount : 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load history.";
    return NextResponse.json({ error: message, runs: [] }, { status: 500 });
  }
}
