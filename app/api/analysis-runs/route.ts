import { NextRequest, NextResponse } from "next/server";
import { ensureUserRecord } from "@/lib/auth";
import { saveAnalysisRun } from "@/lib/analysis-history/saveAnalysisRun";
import type { AnalysisResponse } from "@/types/analysis";

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUserRecord();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const analysis = body?.analysis as AnalysisResponse | undefined;

    if (!analysis || typeof analysis !== "object") {
      return NextResponse.json(
        { error: "Analysis payload is required" },
        { status: 400 }
      );
    }

    if (!analysis.ticker || typeof analysis.ticker !== "string") {
      return NextResponse.json(
        { error: "Analysis payload is invalid" },
        { status: 400 }
      );
    }

    await saveAnalysisRun({
      userId: user.id,
      analysis,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save analysis run",
      },
      { status: 500 }
    );
  }
}