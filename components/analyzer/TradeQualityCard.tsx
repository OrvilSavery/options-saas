import type { BestStrategy, TradeQualityBand } from "@/types/analysis";

interface TradeQualityCardProps {
  bestStrategy: BestStrategy | null;
}

function bandClasses(band: TradeQualityBand) {
  switch (band) {
    case "Strong":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Workable":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Selective":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Weak":
      return "border-red-200 bg-red-50 text-red-700";
  }
}

function bandDescription(band: TradeQualityBand) {
  switch (band) {
    case "Strong":
      return "The selected setup clears the rule set cleanly and shows a stronger overall tradeoff profile.";
    case "Workable":
      return "The setup is usable, but the edge is balanced rather than dominant.";
    case "Selective":
      return "The setup is more marginal and needs tighter selectivity on entry and management.";
    case "Weak":
      return "The setup may still exist on paper, but the overall tradeoff quality is not attractive.";
  }
}

function formatScore(score: number) {
  if (score >= 0 && score <= 1) {
    return `${(score * 100).toFixed(0)}/100`;
  }

  return `${score.toFixed(0)}/100`;
}

export default function TradeQualityCard({ bestStrategy }: TradeQualityCardProps) {
  const score = bestStrategy?.tradeQualityScore ?? null;
  const band = bestStrategy?.tradeQualityBand ?? null;

  if (!bestStrategy || score === null || band === null) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Trade quality
        </h3>
        <p className="mt-3 text-sm text-zinc-500">
          Trade quality is not available for this result.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Trade quality
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Deterministic read on how clean the selected setup looks under the current rules.
          </p>
        </div>

        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${bandClasses(
            band
          )}`}
        >
          {band}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[160px_1fr]">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Score</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{formatScore(score)}</p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            What this means
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">{bandDescription(band)}</p>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            This supports the recommendation. It does not replace the final valid, watchlist, or
            pass decision.
          </p>
        </div>
      </div>
    </section>
  );
}