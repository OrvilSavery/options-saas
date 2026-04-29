import type { AnalysisResponse } from "@/types/analysis";

interface SummaryCardProps {
  data: Pick<
    AnalysisResponse,
    "ticker" | "price" | "marketCondition" | "volatilityCondition" | "eventRisk" | "decision"
  >;
}

function badgeClasses(value: "low" | "medium" | "high" | "valid" | "watchlist" | "pass") {
  switch (value) {
    case "low":
    case "valid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "medium":
    case "watchlist":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "high":
    case "pass":
      return "border-red-200 bg-red-50 text-red-700";
  }
}

function decisionLabel(decision: AnalysisResponse["decision"]) {
  switch (decision) {
    case "valid":
      return "Valid setup";
    case "watchlist":
      return "Watchlist";
    case "pass":
      return "Pass";
  }
}

export default function SummaryCard({ data }: SummaryCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-end gap-3">
            <h2 className="text-2xl font-semibold text-zinc-950">{data.ticker}</h2>
            <span className="pb-0.5 text-sm text-zinc-500">${data.price.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            Structured read first. Recommendation and tradeoffs second.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(
              data.eventRisk
            )}`}
          >
            Event risk: {data.eventRisk}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(
              data.decision
            )}`}
          >
            {decisionLabel(data.decision)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Market condition</p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">{data.marketCondition}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Volatility condition</p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">{data.volatilityCondition}</p>
        </div>
      </div>
    </section>
  );
}