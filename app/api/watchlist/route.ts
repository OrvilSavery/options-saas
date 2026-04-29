import { NextRequest, NextResponse } from "next/server";
import { ensureUserRecord } from "@/lib/auth";
import { addWatchlistItem } from "@/lib/watchlist/addWatchlistItem";
import { getWatchlistItems } from "@/lib/watchlist/getWatchlistItems";
import { removeWatchlistItem } from "@/lib/watchlist/removeWatchlistItem";

export async function GET() {
  try {
    const user = await ensureUserRecord();

    if (!user?.id) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const items = await getWatchlistItems(user.id);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load watchlist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUserRecord();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as { ticker?: string; note?: string | null };
    const ticker = String(body.ticker ?? "").trim().toUpperCase();

    if (!ticker) {
      return NextResponse.json({ error: "Ticker is required." }, { status: 400 });
    }

    const result = await addWatchlistItem({
      userId: user.id,
      ticker,
      note: body.note ?? null,
    });

    return NextResponse.json(
      { ok: true, alreadyExists: result.status === "already_exists" },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add watchlist item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await ensureUserRecord();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as { ticker?: string };
    const ticker = String(body.ticker ?? "").trim().toUpperCase();

    if (!ticker) {
      return NextResponse.json({ error: "Ticker is required." }, { status: 400 });
    }

    await removeWatchlistItem(user.id, ticker);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove watchlist item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
