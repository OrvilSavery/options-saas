"use client";

import { useEffect, useState } from "react";

interface TickerInputProps {
  onSubmit: (ticker: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export default function TickerInput({
  onSubmit,
  disabled = false,
  initialValue = "",
}: TickerInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;

    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          placeholder="Enter ticker (e.g. SPY)"
          maxLength={10}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium tracking-wide text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={disabled || value.trim() === ""}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run analysis
        </button>
      </div>
      <p className="text-sm text-zinc-500">
        V1 uses mocked market logic through a stable response contract. Real data providers plug into the same analysis layer later.
      </p>
    </form>
  );
}