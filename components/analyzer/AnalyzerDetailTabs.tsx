"use client";

import { useState } from "react";
import type { BestStrategy, ComparedSetup, ExecutionEvidence, SetupEvidence, VolatilityPremiumEvidence } from "@/types/analysis";
import SetupDetailsPanel from "@/components/analyzer/SetupDetailsPanel";
import ExecutionPremiumPanel from "@/components/analyzer/ExecutionPremiumPanel";
import WhatToWatchPanel from "@/components/analyzer/WhatToWatchPanel";

type TabId = "watch" | "context" | "setup";

interface AnalyzerDetailTabsProps {
  bestStrategy: BestStrategy | null;
  activeComparedSetup: ComparedSetup | null;
  setupContext: SetupEvidence | null;
  executionContext: ExecutionEvidence | null;
  volatilityPremiumContext: VolatilityPremiumEvidence | null;
  risks: string[];
  explanation: string;
  analysisMode?: "explore" | "review";
}

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "watch", label: "What to watch" },
  { id: "context", label: "Execution and premium" },
  { id: "setup", label: "Setup details" },
];

function buildAltSetupContext(setup: ComparedSetup | null): SetupEvidence | null {
  if (!setup) return null;
  return { shortStrike: setup.shortStrike, longStrike: setup.longStrike, width: setup.width, daysToExpiration: setup.daysToExpiration, downsideRoom: setup.downsideRoom, setupSummary: setup.note };
}

function buildExecutionSummary(setup: ComparedSetup): string {
  const parts: string[] = [];
  if (setup.executionLabel) parts.push(`Execution reads ${setup.executionLabel.toLowerCase()}.`);
  if (setup.bidAskWidth != null) parts.push(`Average bid/ask width is about $${setup.bidAskWidth.toFixed(2)}.`);
  if (setup.volume != null) parts.push(`Displayed volume is ${Math.round(setup.volume)}.`);
  if (setup.openInterest != null) parts.push(`Open interest is ${Math.round(setup.openInterest)}.`);
  return parts.length > 0 ? parts.join(" ") : "Execution context is limited for this compared setup.";
}

function buildAltExecutionContext(setup: ComparedSetup | null): ExecutionEvidence | null {
  if (!setup) return null;
  return { bidAskWidth: setup.bidAskWidth, volume: setup.volume, openInterest: setup.openInterest, executionLabel: setup.executionLabel, executionSummary: buildExecutionSummary(setup) };
}

function buildAltVolatilityPremiumContext(setup: ComparedSetup | null): VolatilityPremiumEvidence | null {
  if (!setup) return null;
  return { premiumEnvironmentLabel: null, volatilityContextLabel: null, premiumToRiskPercent: setup.returnOnRisk, summary: "Premium and risk framing here comes from the compared setup metrics currently available." };
}

function buildAltRisks(setup: ComparedSetup | null): string[] {
  if (!setup) return [];
  const risks: string[] = [];
  if (setup.downsideRoom != null) {
    if (setup.downsideRoom <= 0.04) risks.push("The short strike is relatively close to price, so margin for error is tighter.");
    else if (setup.downsideRoom <= 0.08) risks.push("Room to the short strike is usable, but not especially wide.");
    else risks.push("This setup leaves more room to the short strike before pressure builds.");
  }
  if (setup.executionLabel === "Limited" || setup.executionLabel === "Tight") risks.push("Execution quality is less forgiving, so slippage may matter more.");
  if (setup.daysToExpiration != null && setup.daysToExpiration < 10) risks.push("Short time to expiration leaves less room to respond if price moves toward the short strike.");
  return risks.length > 0 ? risks : ["No additional compared-setup risks were derived from the current review state."];
}

export default function AnalyzerDetailTabs({ activeComparedSetup, setupContext, executionContext, volatilityPremiumContext, risks, explanation, analysisMode = "explore" }: AnalyzerDetailTabsProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("watch");
  const isMainSetup = activeComparedSetup?.role === "current";

  const reviewSetupContext = isMainSetup ? setupContext : buildAltSetupContext(activeComparedSetup);
  const reviewExecutionContext = isMainSetup ? executionContext : buildAltExecutionContext(activeComparedSetup);
  const reviewVolatilityPremiumContext = isMainSetup ? volatilityPremiumContext : buildAltVolatilityPremiumContext(activeComparedSetup);
  const reviewRisks = isMainSetup ? risks : buildAltRisks(activeComparedSetup);
  const reviewExplanation = isMainSetup ? explanation : activeComparedSetup?.note ?? "No setup is currently selected for review.";

  return (
    <section id="detail-section" className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">More details</p>
        </div>
        <button type="button" onClick={() => setExpanded((value) => !value)} className="self-start rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-900 sm:self-auto" aria-expanded={expanded}>
          {expanded ? "Hide details" : "Show details"}
        </button>
      </div>

      {expanded ? (
        <>
          <div className="border-t border-b border-slate-100 px-5 py-3">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab.id === activeTab ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {activeTab === "watch" ? <WhatToWatchPanel risks={reviewRisks} explanation={reviewExplanation} reviewLabel={analysisMode === "review" ? "Your setup" : "Selected setup"} selectedSetup={activeComparedSetup} /> : null}
            {activeTab === "context" ? <ExecutionPremiumPanel selectedSetup={activeComparedSetup} executionContext={reviewExecutionContext} volatilityPremiumContext={reviewVolatilityPremiumContext} reviewLabel={analysisMode === "review" ? "Your setup" : "Selected setup"} isMainSetup={isMainSetup} /> : null}
            {activeTab === "setup" ? <SetupDetailsPanel selectedSetup={activeComparedSetup} setupContext={reviewSetupContext} reviewLabel={analysisMode === "review" ? "Your setup" : "Selected setup"} /> : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
