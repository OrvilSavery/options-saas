"use client";

import { useState } from "react";

interface TickerInputProps {
  onSubmit: (ticker: string) => void;
  disabled?: boolean;
}

export default function TickerInput({ onSubmit, disabled }: TickerInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (trimmed === "") return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        placeholder="Enter ticker (e.g. SPY)"
        disabled={disabled}
        maxLength={10}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        className="px-4 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm font-medium tracking-wide placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 w-48"
      />
      <button
        type="submit"
        disabled={disabled || value.trim() === ""}
        className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Analyze
      </button>
    </form>
  );
}