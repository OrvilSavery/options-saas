import { NextRequest, NextResponse } from "next/server";
import { ensureUserRecord } from "@/lib/auth";
import { deleteAnalysisRun } from "@/lib/analysis-history/deleteAnalysisRun";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await ensureUserRecord();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Analysis run ID is required" },
        { status: 400 }
      );
    }

    await deleteAnalysisRun(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete analysis run",
      },
      { status: 500 }
    );
  }
}