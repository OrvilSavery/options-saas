import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { analyzeTicker } from "@/lib/analyzer/analyzeTicker";
import { checkRateLimit } from "@/lib/api/rateLimit";
import type { AnalyzerEntryRequest } from "@/lib/analyzer/entry/types";

const ANALYZE_RATE_LIMIT = 20;
const ANALYZE_RATE_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rate = checkRateLimit(
      `analyze:${userId}`,
      ANALYZE_RATE_LIMIT,
      ANALYZE_RATE_WINDOW_MS
    );

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please slow down.",
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((rate.resetAt - Date.now()) / 1000)
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))
            ),
            "X-RateLimit-Limit": String(ANALYZE_RATE_LIMIT),
            "X-RateLimit-Remaining": String(rate.remaining),
            "X-RateLimit-Reset": String(rate.resetAt),
          },
        }
      );
    }

    const body = (await request.json()) as AnalyzerEntryRequest & { ticker?: string };

    const ticker = String(body.ticker ?? "").trim().toUpperCase();
    if (!ticker) {
      return NextResponse.json(
        { error: "Ticker is required." },
        { status: 400 }
      );
    }

    const analysis = await analyzeTicker(ticker, body);

    return NextResponse.json(
      { analysis },
      {
        headers: {
          "X-RateLimit-Limit": String(ANALYZE_RATE_LIMIT),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(rate.resetAt),
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
