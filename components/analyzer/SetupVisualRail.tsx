import type { SetupEvidence } from "@/types/analysis";

interface SetupVisualRailProps {
  price: number;
  setupContext: SetupEvidence | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function percentLabel(value: number | null) {
  if (value === null) return "Not available";
  return `${(value * 100).toFixed(1)}%`;
}

export default function SetupVisualRail({
  price,
  setupContext,
}: SetupVisualRailProps) {
  if (!setupContext) {
    return (
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Setup visual
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Setup positioning details are limited for this result.
        </p>
      </section>
    );
  }

  const values = [
    price,
    setupContext.shortStrike ?? price,
    setupContext.longStrike ?? price,
  ];

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const spread = Math.max(maxValue - minValue, 1);
  const padding = spread * 0.35;

  const railMin = minValue - padding;
  const railMax = maxValue + padding;
  const railSpan = railMax - railMin;

  const positionFor = (value: number | null) => {
    if (value === null) return null;
    return clamp(((value - railMin) / railSpan) * 100, 4, 96);
  };

  const pricePosition = positionFor(price);
  const shortPosition = positionFor(setupContext.shortStrike);
  const longPosition = positionFor(setupContext.longStrike);

  return (
    <section>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Setup visual
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            A simple structure view of current price versus the selected short
            and long strikes. This is a visual positioning aid, not a stock chart.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700">
            DTE: {setupContext.daysToExpiration ?? "—"}
          </span>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700">
            Downside room: {percentLabel(setupContext.downsideRoom)}
          </span>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700">
            Width: {setupContext.width ?? "—"}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <div className="relative h-20">
          <div className="absolute left-0 right-0 top-9 h-2 rounded-full bg-zinc-200" />

          {longPosition !== null ? (
            <div
              className="absolute top-5 -translate-x-1/2"
              style={{ left: `${longPosition}%` }}
            >
              <div className="h-10 w-0.5 bg-zinc-400" />
              <div className="mt-2 whitespace-nowrap text-xs font-medium text-zinc-600">
                Long {setupContext.longStrike}
              </div>
            </div>
          ) : null}

          {shortPosition !== null ? (
            <div
              className="absolute top-1 -translate-x-1/2"
              style={{ left: `${shortPosition}%` }}
            >
              <div className="h-14 w-0.5 bg-zinc-900" />
              <div className="mt-2 whitespace-nowrap text-xs font-semibold text-zinc-900">
                Short {setupContext.shortStrike}
              </div>
            </div>
          ) : null}

          <div
            className="absolute top-3 -translate-x-1/2"
            style={{ left: `${pricePosition}%` }}
          >
            <div className="h-6 w-6 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
            <div className="mt-2 whitespace-nowrap text-xs font-semibold text-blue-700">
              Price ${price.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {setupContext.setupSummary ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Setup context
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            {setupContext.setupSummary}
          </p>
        </div>
      ) : null}
    </section>
  );
}