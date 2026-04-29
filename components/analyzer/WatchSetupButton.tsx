"use client";

import { useMemo, useState } from "react";
import type { AnalysisResponse, ComparedSetup } from "@/types/analysis";
import { buildTrackedSetupSnapshot } from "@/lib/tracked-setups/buildTrackedSetupSnapshot";
import { saveTrackedSetupSnapshot } from "@/lib/tracked-setups/storage";

interface WatchSetupButtonProps {
  data: AnalysisResponse;
  activeComparedSetup: ComparedSetup | null;
}

export default function WatchSetupButton({
  data,
  activeComparedSetup,
}: WatchSetupButtonProps) {
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const buttonLabel = useMemo(() => {
    if (savedAt) return "Setup saved";
    return "Watch this setup";
  }, [savedAt]);

  function handleSave() {
    const snapshot = buildTrackedSetupSnapshot(data, activeComparedSetup);
    saveTrackedSetupSnapshot(snapshot);
    setSavedAt(snapshot.trackedAt);
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      className={`inline-flex h-10 items-center rounded-xl border px-4 text-sm font-medium transition ${
        savedAt
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900"
      }`}
    >
      {buttonLabel}
    </button>
  );
}
