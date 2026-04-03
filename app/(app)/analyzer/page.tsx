"use client";

import { useState } from "react";
import type { AnalysisResponse } from "@/types/analysis";
import TickerInput from "@/components/analyzer/TickerInput";
import LoadingState from "@/components/analyzer/LoadingState";
import ErrorState from "@/components/analyzer/ErrorState";
import AnalysisResult from "@/components/analyzer/AnalysisResult";

export default function AnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  async function handleAnalyze(ticker: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed (${res.status})`);
      }

      const data: AnalysisResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-zinc-900 mb-6">Options Analyzer</h1>
      <TickerInput onSubmit={handleAnalyze} disabled={loading} />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {result && <AnalysisResult data={result} />}
    </div>
  );
}
