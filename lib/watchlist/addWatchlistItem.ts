import { supabaseAdmin } from "@/lib/db";

interface AddWatchlistItemInput {
  userId: string;
  ticker: string;
  note?: string | null;
}

export interface AddWatchlistItemResult {
  status: "added" | "already_exists";
}

export async function addWatchlistItem({
  userId,
  ticker,
  note = null,
}: AddWatchlistItemInput): Promise<AddWatchlistItemResult> {
  const normalizedTicker = ticker.trim().toUpperCase();

  const { error } = await supabaseAdmin
    .from("watchlist_items")
    .insert({
      user_id: userId,
      ticker: normalizedTicker,
      note: note?.trim() || null,
    });

  if (error) {
    if (error.code === "23505") {
      return { status: "already_exists" };
    }

    throw new Error(`Failed to add watchlist item: ${error.message}`);
  }

  return { status: "added" };
}