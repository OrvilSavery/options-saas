"use client";

import { useState } from "react";
import type { ComparedSetup, Decision } from "@/types/analysis";

interface TradeoffMatrixProps {
  leadSetup: ComparedSetup | null;
  activeComparedSetup: ComparedSetup | null;
  decision: Decision;
  analysisMode: "explore" | "review";
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function formatWhole(value: number | null | undefined) {
  if (value == null) return "—";
  return `${Math.round(value)}`;
}

function sameSetup(a: ComparedSetup | null, b: ComparedSetup | null) {
  if (!a || !b) return false;
  return [a.role, a.strategy, a.expiration, a.shortStrike, a.longStrike, a.width].join("::") === [b.role, b.strategy, b.expiration, b.shortStrike, b.longStrike, b.width].join("::");
}

function strikeName(setup: ComparedSetup | null) {
  if (!setup) return "Not available";
  return setup.shortStrike != null && setup.longStrike != null ? `${setup.shortStrike}/${setup.longStrike}` : "setup";
}

function compareNumber(active: number | null | undefined, lead: number | null | undefined) {
  if (active == null || lead == null) return null;
  return active - lead;
}

function assessment(metric: "premium" | "room" | "execution" | "dte", lead: ComparedSetup | null, active: ComparedSetup | null) {
  if (!lead || !active) return "Not enough data yet.";
  if (sameSetup(lead, active)) return "Select a nearby setup to see this tradeoff.";
  if (metric === "premium") {
    const delta = compareNumber(active.premium, lead.premium);
    if (delta == null) return "Premium is not available.";
    if (delta > 0.03) return "More credit can help, but it usually comes with less room or more timing pressure.";
    if (delta < -0.03) return "Less credit needs to be justified by more room or cleaner execution.";
    return "Premium is not the main difference.";
  }
  if (metric === "room") {
    const delta = compareNumber(active.downsideRoom, lead.downsideRoom);
    if (delta == null) return "Room is not available.";
    if (delta > 0.003) return "More room gives price more space before strike pressure builds.";
    if (delta < -0.003) return "Less room asks for better timing and entry discipline.";
    return "Room is similar.";
  }
  if (metric === "execution") {
    if (active.executionLabel === lead.executionLabel) return "Execution quality is similar.";
    return active.executionLabel === "Limited" || active.executionLabel === "Tight" ? "Execution is less forgiving." : "Execution looks cleaner in this setup.";
  }
  const delta = compareNumber(active.daysToExpiration, lead.daysToExpiration);
  if (delta == null) return "Timing is not available.";
  if (Math.abs(delta) <= 2) return "Timing is similar.";
  return delta > 0 ? "More time can slow the payoff path." : "Shorter duration makes timing matter more.";
}

function valuesDiffer(a: string, b: string) {
  return a !== b && a !== "—" && b !== "—";
}

export default function TradeoffMatrix({ leadSetup, activeComparedSetup }: TradeoffMatrixProps) {
  const [expanded, setExpanded] = useState(false);
  const isSame = sameSetup(leadSetup, activeComparedSetup);

  const allRows = [
    ["Premium", formatCurrency(activeComparedSetup?.premium), formatCurrency(leadSetup?.premium), assessment("premium", leadSetup, activeComparedSetup)],
    ["Room", formatPercent(activeComparedSetup?.downsideRoom), formatPercent(leadSetup?.downsideRoom), assessment("room", leadSetup, activeComparedSetup)],
    ["Execution", activeComparedSetup?.executionLabel ?? "—", leadSetup?.executionLabel ?? "—", assessment("execution", leadSetup, activeComparedSetup)],
    ["DTE", formatWhole(activeComparedSetup?.daysToExpiration), formatWhole(leadSetup?.daysToExpiration), assessment("dte", leadSetup, activeComparedSetup)],
  ];
  const rows = allRows.filter(([, active, lead]) => valuesDiffer(active, lead));

  return (
    <section id="tradeoff-matrix-section" className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left" aria-expanded={expanded}>
        <span className="text-sm font-medium text-slate-800">Setup tradeoffs</span>
        <span className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">{expanded ? "Hide" : "Compare"}</span>
      </button>

      {expanded ? (
        <div className="border-t border-slate-100 p-4">
          {isSame || rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
              Select a nearby setup to see tradeoffs. This prevents comparing the setup against itself.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Metric</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Selected · {strikeName(activeComparedSetup)}</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Compared · {strikeName(leadSetup)}</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Why it matters</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, active, lead, note]) => (
                    <tr key={label}>
                      <td className="rounded-l-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900">{label}</td>
                      <td className="border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900">{active}</td>
                      <td className="border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900">{lead}</td>
                      <td className="rounded-r-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-600">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
