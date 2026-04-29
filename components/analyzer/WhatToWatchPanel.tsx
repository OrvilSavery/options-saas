import type { ComparedSetup } from "@/types/analysis";

interface WhatToWatchPanelProps {
  risks: string[];
  explanation: string;
  reviewLabel: string;
  selectedSetup: ComparedSetup | null;
}

function buildRiskHighlight(risk: string, setup: ComparedSetup | null) {
  const lower = risk.toLowerCase();
  const strategy = setup?.strategy?.toLowerCase() ?? "";

  if (lower.includes("short strike")) {
    return "Check the short strike placement on the setup map.";
  }

  if (lower.includes("execution") || lower.includes("slippage")) {
    return "Cross-check this in the execution and premium context tab.";
  }

  if (lower.includes("time to expiration") || lower.includes("dte")) {
    return "Pressure-test the timing tradeoff in setup details.";
  }

  if (lower.includes("width") || lower.includes("max loss")) {
    return "Review strike spacing and width together in setup details.";
  }

  if (strategy.includes("put") && lower.includes("room")) {
    return "Use the map to judge how much downside room remains above the short strike.";
  }

  if (strategy.includes("call") && lower.includes("room")) {
    return "Use the map to judge how much room remains below the short strike.";
  }

  return "Use the map and setup details together when reviewing this risk.";
}

export default function WhatToWatchPanel({
  risks,
  explanation,
  reviewLabel,
  selectedSetup,
}: WhatToWatchPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          What to watch
        </p>
        <h3 className="mt-2 text-xl font-semibold text-zinc-950">
          Focus on the flagged risks.
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{reviewLabel}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Main risks
          </p>

          {risks.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {risks.map((risk) => (
                <li
                  key={risk}
                  className="rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex gap-3">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                    <div>
                      <p className="text-sm leading-6 text-zinc-800">{risk}</p>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        {buildRiskHighlight(risk, selectedSetup)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              No specific risks are flagged for this result.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Structured explanation
          </p>
          <p className="mt-4 text-sm leading-7 text-zinc-700">{explanation}</p>
        </section>
      </div>
    </div>
  );
}