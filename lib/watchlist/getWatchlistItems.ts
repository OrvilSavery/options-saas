import { supabaseAdmin } from "@/lib/db";

export interface WatchlistItem {
  id: string;
  ticker: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export async function getWatchlistItems(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("watchlist_items")
    .select("id, ticker, note, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load watchlist items: ${error.message}`);
  }

  return (data ?? []) as WatchlistItem[];
}