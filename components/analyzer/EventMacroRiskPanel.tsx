"use client";

import { useState } from "react";
import type { AnalysisMetadata, EventRisk, EventRiskFlag } from "@/types/analysis";

interface EventMacroRiskPanelProps {
  eventRisk: EventRisk;
  eventRisks?: EventRiskFlag[];
  marketCondition: string;
  volatilityCondition: string;
  risks: string[];
  metadata?: AnalysisMetadata;
}

function eventTone(eventRisk: EventRisk) {
  if (eventRisk === "high") return "border-red-200 bg-red-50 text-red-800";
  if (eventRisk === "medium") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function eventLabel(eventRisk: EventRisk) {
  if (eventRisk === "high") return "High";
  if (eventRisk === "medium") return "Moderate";
  return "Low";
}

function flagTone(severity: EventRiskFlag["severity"]) {
  if (severity === "danger") return "border-l-red-400";
  if (severity === "warning") return "border-l-amber-400";
  return "border-l-emerald-400";
}

function buildFallbackNotes(eventRisk: EventRisk, marketCondition: string, volatilityCondition: string, risks: string[]) {
  const notes: Array<{ title: string; body: string; tone: "green" | "amber" | "red" | "neutral" }> = [];

  if (eventRisk === "high") {
    notes.push({ title: "Known event risk", body: "Event pressure is elevated in the current review window.", tone: "red" });
  } else if (eventRisk === "medium") {
    notes.push({ title: "Known event risk", body: "No extreme event pressure is flagged, but it is worth checking before entry.", tone: "amber" });
  } else {
    notes.push({ title: "Known event risk", body: "No major scheduled event is flagged by the current analyzer inputs.", tone: "green" });
  }

  if (marketCondition) notes.push({ title: "Market backdrop", body: marketCondition, tone: "neutral" });
  if (volatilityCondition) notes.push({ title: "Volatility backdrop", body: volatilityCondition, tone: "neutral" });

  const eventRelatedRisks = risks.filter((risk) => {
    const lower = risk.toLowerCase();
    return lower.includes("event") || lower.includes("earnings") || lower.includes("catalyst") || lower.includes("volatility") || lower.includes("macro");
  });

  for (const risk of eventRelatedRisks.slice(0, 2)) {
    notes.push({ title: "Review note", body: risk, tone: eventRisk === "high" ? "red" : "amber" });
  }

  return notes.slice(0, 5);
}

function fallbackToneBorder(tone: "green" | "amber" | "red" | "neutral") {
  if (tone === "green") return "border-l-emerald-400";
  if (tone === "amber") return "border-l-amber-400";
  if (tone === "red") return "border-l-red-400";
  return "border-l-slate-300";
}

export default function EventMacroRiskPanel({
  eventRisk,
  eventRisks = [],
  marketCondition,
  volatilityCondition,
  risks,
  metadata,
}: EventMacroRiskPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const fallbackNotes = buildFallbackNotes(eventRisk, marketCondition, volatilityCondition, risks);
  const hasSpecificEventFlags = eventRisks.length > 0;

  return (
    <section id="event-risk-section" className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left" aria-expanded={expanded}>
        <span className="text-sm font-medium text-slate-800">Event & market risk</span>
        <span className="flex items-center gap-2">
          <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${eventTone(eventRisk)}`}>{eventLabel(eventRisk)}</span>
          <span className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">{expanded ? "Hide details" : "Show details"}</span>
        </span>
      </button>

      {expanded ? (
        <div className="grid gap-3 border-t border-slate-100 p-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">What to check</p>
            <ul className="mt-3 space-y-2">
              {hasSpecificEventFlags ? eventRisks.slice(0, 5).map((flag) => (
                <li key={flag.id} className={`rounded-lg border border-l-4 border-slate-200 bg-white px-3 py-2 ${flagTone(flag.severity)}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900">{flag.label}</p>
                    {flag.timing ? <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{flag.timing}</span> : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{flag.explanation}</p>
                </li>
              )) : fallbackNotes.map((note) => (
                <li key={`${note.title}-${note.body}`} className={`rounded-lg border border-l-4 border-slate-200 bg-white px-3 py-2 ${fallbackToneBorder(note.tone)}`}>
                  <p className="text-xs font-semibold text-slate-900">{note.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{note.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Coverage note</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {metadata?.dataSource === "mock"
                ? "Demo data is being used for this review, not live market data."
                : "Based on scheduled events and market data available at analysis time."}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Live headlines and unscheduled news are not included in this review. This section is a scheduled-risk check, not a prediction.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
