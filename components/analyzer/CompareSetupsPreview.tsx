"use client";

import { useState } from "react";
import type { Alternative, ComparedSetup } from "@/types/analysis";

interface CompareSetupsPreviewProps {
  currentPrice: number;
  currentComparedSetup: ComparedSetup | null;
  comparedSetups: ComparedSetup[];
  saferAlternative: Alternative | null;
  aggressiveAlternative: Alternative | null;
  activeSetupKey: string;
  onSelectSetup: (setupKey: string) => void;
  leadSetup: ComparedSetup | null;
  activeComparedSetup: ComparedSetup | null;
  analysisMode: "explore" | "review";
}

function setupKey(setup: ComparedSetup | null): string {
  if (!setup) return "";
  return [setup.role, setup.strategy, setup.expiration, setup.setupLabel, setup.shortStrike, setup.longStrike, setup.width].join("::");
}

function dedupeSetups(setups: Array<ComparedSetup | null>): ComparedSetup[] {
  const seen = new Set<string>();
  const results: ComparedSetup[] = [];
  for (const setup of setups) {
    if (!setup) continue;
    const key = setupKey(setup);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(setup);
  }
  return results;
}

function getSetupByRole(setups: ComparedSetup[], role: ComparedSetup["role"]): ComparedSetup | null {
  return setups.find((setup) => setup.role === role) ?? null;
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function shortDate(expiration: string | null | undefined) {
  if (!expiration) return "";
  const parsed = new Date(`${expiration}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return expiration;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function plainSetupTitle(setup: ComparedSetup) {
  const strikes = setup.shortStrike != null && setup.longStrike != null ? `${setup.shortStrike}/${setup.longStrike}` : "strikes unavailable";
  return `${shortDate(setup.expiration)} ${strikes} ${setup.strategy}`;
}

function clampPct(value: number) {
  return Math.max(4, Math.min(96, value));
}

function markerPositions(setup: ComparedSetup, currentPrice: number) {
  const strikes = [setup.longStrike, setup.shortStrike].filter((value): value is number => value != null && Number.isFinite(value));
  const values = [...strikes, currentPrice].filter(Number.isFinite);
  if (values.length === 0) return { longPct: 25, shortPct: 45, currentPct: 75 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.2, 1);
  const left = min - pad;
  const right = max + pad;
  const span = Math.max(right - left, 1);
  const toPct = (value: number | null | undefined, fallback: number) => value == null || !Number.isFinite(value) ? fallback : clampPct(((value - left) / span) * 100);
  return { longPct: toPct(setup.longStrike, 25), shortPct: toPct(setup.shortStrike, 45), currentPct: toPct(currentPrice, 75) };
}

function CompactMissingNote({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">{children}</div>;
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Long strike</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Short strike</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-900" /> Current price</span>
    </div>
  );
}

function SetupCard({ label, setup, currentPrice, isSelected, onSelect, note }: { label: string; setup: ComparedSetup; currentPrice: number; isSelected: boolean; onSelect: () => void; note: string }) {
  const positions = markerPositions(setup, currentPrice);

  return (
    <article className={`rounded-xl border bg-white p-4 transition ${isSelected ? "border-slate-950 shadow-sm" : "border-slate-200 hover:border-slate-400"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        {isSelected ? <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Selected</span> : null}
      </div>

      <h4 className="mt-3 text-sm font-semibold leading-6 text-slate-950">{plainSetupTitle(setup)}</h4>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
        <span><strong className="font-semibold text-slate-950">{formatCurrency(setup.premium)}</strong> credit</span>
        <span><strong className="font-semibold text-slate-950">{formatPercent(setup.downsideRoom)}</strong> room</span>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 px-3 py-4">
        <div className="relative h-5">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
          <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-4 ring-red-100" style={{ left: `${positions.longPct}%` }} title="Long strike" />
          <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 ring-4 ring-amber-100" style={{ left: `${positions.shortPct}%` }} title="Short strike" />
          <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950 ring-4 ring-slate-100" style={{ left: `${positions.currentPct}%` }} title="Current price" />
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>

      {!isSelected ? (
        <button type="button" onClick={onSelect} className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
          Review this setup
        </button>
      ) : null}
    </article>
  );
}

export default function CompareSetupsPreview({ currentPrice, currentComparedSetup, comparedSetups, saferAlternative, aggressiveAlternative, activeSetupKey, onSelectSetup, activeComparedSetup, analysisMode }: CompareSetupsPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const mergedSetups = dedupeSetups([...comparedSetups, currentComparedSetup, saferAlternative, aggressiveAlternative]);
  const moreRoomSetup = getSetupByRole(mergedSetups, "safer");
  const currentSetup = getSetupByRole(mergedSetups, "current") ?? currentComparedSetup ?? activeComparedSetup;
  const moreCreditSetup = getSetupByRole(mergedSetups, "higher_premium") ?? aggressiveAlternative;
  const availableSetups = [moreRoomSetup, currentSetup, moreCreditSetup].filter((setup): setup is ComparedSetup => Boolean(setup));
  if (availableSetups.length === 0) return null;

  const currentLabel = analysisMode === "review" ? "Your setup" : "Setup found";

  return (
    <section id="compare-section" className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left" aria-expanded={expanded}>
        <span className="text-sm font-medium text-slate-800">Compare nearby setups</span>
        <span className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">{availableSetups.length} setup{availableSetups.length === 1 ? "" : "s"}</span>
          <span className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">{expanded ? "Hide setups" : "Show setups"}</span>
        </span>
      </button>

      {expanded ? (
        <div className="border-t border-slate-100 p-4">
          <Legend />
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {moreRoomSetup ? <SetupCard label="More room" setup={moreRoomSetup} currentPrice={currentPrice} isSelected={setupKey(moreRoomSetup) === activeSetupKey} onSelect={() => onSelectSetup(setupKey(moreRoomSetup))} note="More room, usually for less credit." /> : null}
            {currentSetup ? <SetupCard label={currentLabel} setup={currentSetup} currentPrice={currentPrice} isSelected={setupKey(currentSetup) === activeSetupKey} onSelect={() => onSelectSetup(setupKey(currentSetup))} note={analysisMode === "review" ? "The setup you’re reviewing." : "The setup found for review."} /> : null}
            {moreCreditSetup ? <SetupCard label="More credit" setup={moreCreditSetup} currentPrice={currentPrice} isSelected={setupKey(moreCreditSetup) === activeSetupKey} onSelect={() => onSelectSetup(setupKey(moreCreditSetup))} note="More credit, usually with less room." /> : null}
          </div>

          {availableSetups.length === 1 ? <div className="mt-4"><CompactMissingNote>No nearby alternatives found for this expiration.</CompactMissingNote></div> : null}
          {availableSetups.length > 1 && (!moreRoomSetup || !moreCreditSetup) ? (
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {!moreRoomSetup ? <CompactMissingNote>No more-room setup found that clears the review rules.</CompactMissingNote> : null}
              {!moreCreditSetup ? <CompactMissingNote>No more-credit setup found that clears the review rules.</CompactMissingNote> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
