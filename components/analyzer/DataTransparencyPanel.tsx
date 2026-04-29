"use client";

import { useState } from "react";
import type { AnalysisMetadata, DataQualityStatus, ReviewCoverageStatus } from "@/types/analysis";

interface DataTransparencyPanelProps {
  metadata?: AnalysisMetadata;
}

function statusTone(status: DataQualityStatus | undefined) {
  if (status === "good") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "limited") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function coverageTone(status: ReviewCoverageStatus) {
  if (status === "checked") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "limited") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function coverageMark(status: ReviewCoverageStatus) {
  if (status === "checked") return "✓";
  if (status === "limited") return "!";
  return "—";
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) return "Not labeled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not labeled";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export default function DataTransparencyPanel({ metadata }: DataTransparencyPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const quality = metadata?.dataQuality;
  const qualityLabel = quality?.label ?? "Unknown";
  const flags = quality?.flags ?? [];
  const coverage = metadata?.eventCoverage ?? [];
  const scope = metadata?.reviewScope;

  return (
    <section id="data-quality-section" className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
        aria-expanded={expanded}
      >
        <span className="text-sm font-medium text-slate-800">Data quality & review scope</span>
        <span className="flex items-center gap-2">
          <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusTone(quality?.status)}`}>
            {qualityLabel}
          </span>
          <span className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">
            {expanded ? "Hide details" : "Show details"}
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="grid gap-3 border-t border-slate-100 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Review scope</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{scope?.modeLabel ?? "Analyzer review"}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {scope?.summary ?? "Reviewed the available setup information for this run."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {scope?.expirationWindowLabel ? (
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600">
                    {scope.expirationWindowLabel}
                  </span>
                ) : null}
                {scope?.preferredWindowLabel ? (
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600">
                    {scope.preferredWindowLabel}
                  </span>
                ) : null}
                {typeof scope?.screenedExpirationCount === "number" ? (
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600">
                    {scope.screenedExpirationCount} expirations checked
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Freshness</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Analyzed</dt>
                  <dd className="font-mono text-xs text-slate-900">{formatTimestamp(metadata?.analyzedAt)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Session</dt>
                  <dd className="text-slate-900">{metadata?.marketSessionLabel ?? "Session not labeled"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Quote</dt>
                  <dd className="text-slate-900">{metadata?.quoteStatusLabel ?? "Quote source not labeled"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Source</dt>
                  <dd className="text-slate-900">{metadata?.dataSourceLabel ?? "Unknown source"}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Event coverage checked</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {coverage.length > 0 ? coverage.map((item) => (
                <div key={item.id} className={`rounded-lg border px-3 py-2 ${coverageTone(item.status)}`}>
                  <p className="text-xs font-semibold">{coverageMark(item.status)} {item.label}</p>
                  {item.explanation ? <p className="mt-1 text-xs leading-5 opacity-80">{item.explanation}</p> : null}
                </div>
              )) : (
                <p className="text-sm text-slate-500">Coverage details were not attached to this saved review.</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Limited or missing inputs</p>
              {flags.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {flags.map((flag) => (
                    <li key={flag.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs font-semibold text-slate-900">{flag.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{flag.explanation}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-600">All required inputs for this review were available.</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">How this review works</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <p>Rules calculate the review. AI does not decide the verdict.</p>
                <p>The deterministic engine handles payoff math, strike distance, timing, premium quality, execution quality, event checks, ranking, and posture.</p>
                <p>Any AI explanation should only use the evidence object created by the rules engine.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
