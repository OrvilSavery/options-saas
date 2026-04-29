"use client";

import { useState, type FormEvent } from "react";

interface AddTickerFormProps {
  onAddTicker?: (ticker: string) => void | Promise<void>;
  onSaved?: () => void;
}

export default function AddTickerForm({ onAddTicker, onSaved }: AddTickerFormProps) {
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ticker = value.trim().toUpperCase();
    if (!ticker || isSaving) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (onAddTicker) {
        await onAddTicker(ticker);
        setValue("");
        setMessage(`${ticker} added to watchlist.`);
        onSaved?.();
      } else {
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker }),
        });

        let responseBody: { error?: string; alreadyExists?: boolean } = {};
        try {
          responseBody = (await response.json()) as { error?: string; alreadyExists?: boolean };
        } catch {
          // ignore parse error
        }

        if (!response.ok) {
          throw new Error(responseBody.error ?? "Failed to add ticker.");
        }

        setValue("");
        if (responseBody.alreadyExists) {
          setMessage(`${ticker} is already in your watchlist.`);
        } else {
          setMessage(`${ticker} added to watchlist.`);
          onSaved?.();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add ticker.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          id="watchlist-ticker-input"
          value={value}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          placeholder="Add a ticker..."
          disabled={isSaving}
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 font-mono text-sm text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
        <button
          type="submit"
          disabled={isSaving || !value.trim()}
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
        >
          {isSaving ? "Adding…" : "Add to list"}
        </button>
      </div>
      {message ? <p className="text-xs font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </form>
  );
}
