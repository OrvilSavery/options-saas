"use client";

import type { SetupContinuitySummary } from "@/lib/history/types";

export default function SetupContinuityCard({
  continuity,
}: {
  continuity: SetupContinuitySummary;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        What changed
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-800">{continuity.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
          Prior: {continuity.priorPosture}
        </span>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
          Current: {continuity.currentPosture}
        </span>
      </div>
    </div>
  );
}
