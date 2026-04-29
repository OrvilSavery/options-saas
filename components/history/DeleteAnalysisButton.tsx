"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteAnalysisButtonProps {
  runId: string;
  compact?: boolean;
  onDeleted?: () => void;
}

export default function DeleteAnalysisButton({
  runId,
  compact = false,
  onDeleted,
}: DeleteAnalysisButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this saved analysis? This cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analysis-runs/${runId}`, {
        method: "DELETE",
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Failed to delete saved analysis");
      }

      onDeleted?.();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete saved analysis"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-xl border border-red-200 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 ${
          compact ? "h-9 px-3" : "h-11 px-4"
        }`}
      >
        {loading ? "Deleting..." : "Delete saved analysis"}
      </button>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}