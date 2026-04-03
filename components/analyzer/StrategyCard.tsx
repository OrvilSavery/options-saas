import type { BestStrategy } from "@/types/analysis";

interface StrategyCardProps {
  bestStrategy: BestStrategy | null;
}

export default function StrategyCard({ bestStrategy }: StrategyCardProps) {
  if (!bestStrategy) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-2">Best Strategy</h3>
        <p className="text-sm text-zinc-400">No strategy identified for this ticker right now.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-zinc-900 mb-3">Best Strategy</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="font-medium text-zinc-900">{bestStrategy.strategy}</span>
          <span className="text-zinc-500">{bestStrategy.expiration}</span>
        </div>
        <p className="text-zinc-700 font-medium">{bestStrategy.setupLabel}</p>
        <div className="flex gap-6 pt-1">
          {bestStrategy.premium !== null && (
            <div>
              <span className="text-xs text-zinc-400 block">Premium</span>
              <span className="font-semibold text-zinc-900">${bestStrategy.premium.toFixed(2)}</span>
            </div>
          )}
          {bestStrategy.returnOnRisk !== null && (
            <div>
              <span className="text-xs text-zinc-400 block">Return on Risk</span>
              <span className="font-semibold text-zinc-900">
                {(bestStrategy.returnOnRisk * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <p className="text-zinc-600 pt-2 leading-relaxed">{bestStrategy.whyTopRanked}</p>
      </div>
    </div>
  );
}
