import type { BestStrategy } from "@/types/analysis";

interface StrategyCardProps {
  bestStrategy: BestStrategy | null;
}

export default function StrategyCard({ bestStrategy }: StrategyCardProps) {
  if (!bestStrategy) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Top-ranked strategy</h3>
        <p className="mt-3 text-sm text-zinc-500">No strategy qualified for a current recommendation.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Top-ranked strategy</h3>
          <p className="mt-2 text-xl font-semibold text-zinc-950">{bestStrategy.strategy}</p>
          <p className="mt-1 text-sm font-medium text-zinc-700">{bestStrategy.setupLabel}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          <p>Expiration: <span className="font-medium text-zinc-900">{bestStrategy.expiration}</span></p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Premium</p>
          <p className="mt-1 text-lg font-semibold text-zinc-950">
            {bestStrategy.premium !== null ? `$${bestStrategy.premium.toFixed(2)}` : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Return on risk</p>
          <p className="mt-1 text-lg font-semibold text-zinc-950">
            {bestStrategy.returnOnRisk !== null
              ? `${(bestStrategy.returnOnRisk * 100).toFixed(1)}%`
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-zinc-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Why it ranked first</p>
        <p className="mt-2 text-sm leading-6 text-zinc-700">{bestStrategy.whyTopRanked}</p>
      </div>
    </section>
  );
}