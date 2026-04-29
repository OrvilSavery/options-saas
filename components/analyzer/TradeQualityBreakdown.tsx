"use client";

import { useEffect, useRef, useState } from "react";

interface TradeQualityBreakdownProps {
  score: number | null;
  band: string | null;
}

function formatScore(value: number | null) {
  if (value == null) return "—";
  if (value >= 0 && value <= 1) return `${(value * 100).toFixed(0)}/100`;
  return `${value.toFixed(0)}/100`;
}

export default function TradeQualityBreakdown({
  score,
  band,
}: TradeQualityBreakdownProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openPanel() {
    clearCloseTimer();
    setOpen(true);
  }

  function closePanelSoon() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <div
      className="relative z-40"
      onMouseEnter={openPanel}
      onMouseLeave={closePanelSoon}
      onFocus={openPanel}
      onBlur={closePanelSoon}
    >
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-semibold text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700"
        aria-label="What goes into trade quality"
        aria-expanded={open}
      >
        ?
      </button>

      {open ? (
        <div className="absolute left-1/2 top-10 w-[280px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Trade quality
              </p>
              <p className="mt-1 text-xl font-semibold text-zinc-950">
                {formatScore(score)}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">
                {band ?? "Not available"}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <BreakdownRow
              label="Downside room"
              note="How much room price has before the short strike comes under pressure."
            />
            <BreakdownRow
              label="Risk / reward"
              note="How much credit is being collected for the defined-risk structure."
            />
            <BreakdownRow
              label="Execution"
              note="How workable the spread looks to enter and manage."
            />
            <BreakdownRow
              label="Timing"
              note="How the current duration fits the review framework."
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BreakdownRow({
  label,
  note,
}: {
  label: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
      <p className="text-sm font-semibold text-zinc-900">{label}</p>
      <p className="mt-0.5 text-[11px] leading-5 text-zinc-600">{note}</p>
    </div>
  );
}