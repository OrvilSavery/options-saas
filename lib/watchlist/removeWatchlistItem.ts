import { supabaseAdmin } from "@/lib/db";

export async function removeWatchlistItem(userId: string, ticker: string) {
  const normalizedTicker = ticker.trim().toUpperCase();

  const { error } = await supabaseAdmin
    .from("watchlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("ticker", normalizedTicker);

  if (error) {
    throw new Error(`Failed to remove watchlist item: ${error.message}`);
  }
}