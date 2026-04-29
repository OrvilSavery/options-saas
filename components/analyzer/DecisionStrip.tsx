"use client";

import type { ReactNode } from "react";
import type { BestStrategy, ComparedSetup, Decision } from "@/types/analysis";

interface DecisionStripProps {
  ticker: string;
  decision: Decision;
  bestStrategy: BestStrategy | null;
  leadSetup: ComparedSetup | null;
  activeComparedSetup: ComparedSetup | null;
  compareOutcomeTitle: string;
  compareOutcomeSummary: string;
  analysisMode: "explore" | "review";
  onSaveAnalysis?: () => void;
  onWatchSetup?: () => void;
  isSaved?: boolean;
  isWatching?: boolean;
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DecisionStrip(_props: DecisionStripProps) {
  return (
    <nav className="sticky top-3 z-20 rounded-[10px] border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <NavButton id="verdict-section">Verdict</NavButton>
        <NavButton id="payoff-section">Position</NavButton>
        <NavButton id="compare-section">Alternatives</NavButton>
        <NavButton id="detail-section">Details</NavButton>
      </div>
    </nav>
  );
}

function NavButton({ id, children }: { id: string; children: ReactNode }) {
  return <button type="button" onClick={() => scrollToSection(id)} className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950">{children}</button>;
}
