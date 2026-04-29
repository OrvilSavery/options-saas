"use client";

import { useEffect, useRef, useState } from "react";
import type { BestStrategy } from "@/types/analysis";

interface TradeQualityExplainabilityProps {
  score: number | null;
  band: BestStrategy["tradeQualityBand"] | null;
  compact?: boolean;
}

function formatScore(value: number | null) {
  if (value == null) return "—";
  if (value >= 0 && value <= 1) return `${(value * 100).toFixed(0)}/100`;
  return `${value.toFixed(0)}/100`;
}

function bandClasses(band: BestStrategy["tradeQualityBand"] | null) {
  switch (band) {
    case "Strong":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Workable":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Selective":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Weak":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

export default function TradeQualityExplainability({
  score,
  band,
  compact = false,
}: TradeQualityExplainabilityProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative inline-flex items-center gap-2">
      <span
        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${bandClasses(
          band
        )}`}
      >
        Trade quality: {band ?? "Not available"}
      </span>

      {!compact ? (
        <span className="text-sm font-semibold text-zinc-700">
          {formatScore(score)}
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-semibold text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
        aria-expanded={open}
        aria-label="Explain trade quality"
      >
        ?
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-30 w-[320px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Trade quality
          </p>

          <h4 className="mt-2 text-base font-semibold text-zinc-950">
            What this score reflects
          </h4>

          <p className="mt-2 text-sm leading-6 text-zinc-700">
            This score is driven by deterministic review categories, not AI
            judgment.
          </p>

          <div className="mt-4 space-y-2">
            <ExplainRow
              label="Downside room"
              text="How much room the setup leaves to the short strike."
            />
            <ExplainRow
              label="Risk / reward"
              text="How the collected premium compares with the defined risk."
            />
            <ExplainRow
              label="Time structure"
              text="Whether the setup sits in a more workable duration window."
            />
            <ExplainRow
              label="Execution quality"
              text="How forgiving the structure looks to enter and manage."
            />
            <ExplainRow
              label="Volatility context"
              text="Whether the volatility backdrop supports the premium-selling review."
            />
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Current limitation
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Exact component point splits are not yet exposed in the shared
              response contract, so this view explains what drives the score
              without inventing fake precision.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExplainRow({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-sm font-semibold text-zinc-900">{label}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-700">{text}</p>
    </div>
  );
}