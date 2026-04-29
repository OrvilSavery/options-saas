"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WatchlistAddButtonProps {
  ticker: string;
}

export default function WatchlistAddButton({
  ticker,
}: WatchlistAddButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMessage(null);
  }, [ticker]);

  async function handleAdd() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Failed to add to watchlist");
      }

      if (body?.result?.status === "already_exists") {
        setMessage("Already in watchlist");
      } else {
        setMessage("Saved to watchlist");
      }

      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add to watchlist");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving..." : `Add ${ticker} to watchlist`}
      </button>

      {message ? <p className="text-sm text-zinc-500">{message}</p> : null}
    </div>
  );
}