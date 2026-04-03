import type { AnalysisResponse } from "@/types/analysis";

interface SummaryCardProps {
  data: Pick<
    AnalysisResponse,
    "ticker" | "price" | "marketCondition" | "volatilityCondition" | "eventRisk" | "decision"
  >;
}

function riskColor(risk: AnalysisResponse["eventRisk"]): string {
  switch (risk) {
    case "low":
      return "text-green-700 bg-green-50 border-green-200";
    case "medium":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
  }
}

function decisionColor(decision: AnalysisResponse["decision"]): string {
  switch (decision) {
    case "valid":
      return "text-green-700 bg-green-50 border-green-200";
    case "watchlist":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "pass":
      return "text-red-700 bg-red-50 border-red-200";
  }
}

function decisionLabel(decision: AnalysisResponse["decision"]): string {
  switch (decision) {
    case "valid":
      return "Valid Setup";
    case "watchlist":
      return "Watchlist";
    case "pass":
      return "Pass";
  }
}

export default function SummaryCard({ data }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-bold text-zinc-900">{data.ticker}</h2>
          <span className="text-sm text-zinc-500">${data.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${riskColor(data.eventRisk)}`}
          >
            Event Risk: {data.eventRisk}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${decisionColor(data.decision)}`}
          >
            {decisionLabel(data.decision)}
          </span>
        </div>
      </div>
      <div className="space-y-2 text-sm text-zinc-600">
        <p>
          <span className="font-medium text-zinc-700">Market: </span>
          {data.marketCondition}
        </p>
        <p>
          <span className="font-medium text-zinc-700">Volatility: </span>
          {data.volatilityCondition}
        </p>
      </div>
    </div>
  );
}
