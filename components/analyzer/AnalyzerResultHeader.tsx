import type { Decision, EventRisk } from "@/types/analysis";

interface AnalyzerResultHeaderProps {
  ticker: string;
  price: number;
  decision: Decision;
  eventRisk: EventRisk;
  marketCondition: string;
  volatilityCondition: string;
}

function toneClasses(value: Decision | EventRisk) {
  switch (value) {
    case "valid":
    case "low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "watchlist":
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "pass":
    case "high":
      return "border-red-200 bg-red-50 text-red-700";
  }
}

function decisionLabel(decision: Decision) {
  switch (decision) {
    case "valid":
      return "Valid setup";
    case "watchlist":
      return "Watchlist";
    case "pass":
      return "Pass";
  }
}

export default function AnalyzerResultHeader({
  ticker,
  price,
  decision,
  eventRisk,
  marketCondition,
  volatilityCondition,
}: AnalyzerResultHeaderProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between md:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Analyzer result
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
              {ticker}
            </h2>
            <span className="pb-1 text-base text-zinc-500">
              ${price.toFixed(2)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Structural review with defined-risk setups and nearby tradeoffs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses(
              decision
            )}`}
          >
            {decisionLabel(decision)}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses(
              eventRisk
            )}`}
          >
            Event risk: {eventRisk}
          </span>
        </div>
      </div>

      <div className="grid gap-px border-t border-zinc-200 bg-zinc-200 md:grid-cols-2">
        <div className="bg-zinc-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Market condition
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            {marketCondition}
          </p>
        </div>

        <div className="bg-zinc-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Volatility condition
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            {volatilityCondition}
          </p>
        </div>
      </div>
    </section>
  );
}