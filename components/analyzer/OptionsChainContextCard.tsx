import type {
  ExecutionEvidence,
  ExecutionLabel,
  SetupEvidence,
} from "@/types/analysis";

interface OptionsChainContextCardProps {
  setupContext: SetupEvidence | null;
  executionContext: ExecutionEvidence | null;
}

function formatNumber(
  value: number | null,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", options).format(value);
}

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "Not available";
  }

  const normalized = value > 1 ? value / 100 : value;

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(normalized);
}

function formatCompact(value: number | null): string {
  if (value === null) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getExecutionToneClasses(label: ExecutionLabel | null): string {
  switch (label) {
    case "Clean":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Usable":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Tight":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Limited":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

export default function OptionsChainContextCard({
  setupContext,
  executionContext,
}: OptionsChainContextCardProps) {
  if (!setupContext && !executionContext) {
    return null;
  }

  const structureRows = [
    {
      label: "Short strike",
      value: formatNumber(setupContext?.shortStrike ?? null, {
        maximumFractionDigits: 2,
      }),
      helper: null,
    },
    {
      label: "Long strike",
      value: formatNumber(setupContext?.longStrike ?? null, {
        maximumFractionDigits: 2,
      }),
      helper: null,
    },
    {
      label: "Width",
      value: formatNumber(setupContext?.width ?? null, {
        maximumFractionDigits: 2,
      }),
      helper: null,
    },
    {
      label: "DTE",
      value: formatNumber(setupContext?.daysToExpiration ?? null),
      helper: "Days to expiration",
    },
    {
      label: "Downside room",
      value: formatPercent(setupContext?.downsideRoom ?? null),
      helper: "Distance from spot to the short strike",
    },
  ];

  const executionRows = [
    {
      label: "Bid/ask width",
      value: formatCurrency(executionContext?.bidAskWidth ?? null),
      helper: "Helps frame entry and exit cleanliness",
    },
    {
      label: "Volume",
      value: formatCompact(executionContext?.volume ?? null),
      helper: "Trading activity around the selected setup",
    },
    {
      label: "Open interest",
      value: formatCompact(executionContext?.openInterest ?? null),
      helper: "Shows existing positioning and liquidity depth",
    },
  ];

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Setup context
        </h3>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">
          Supporting details for the selected structure. This section helps the
          user review strike placement and execution conditions without repeating
          the main recommendation.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Structure
          </div>

          {setupContext?.setupSummary ? (
            <div className="mb-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
              {setupContext.setupSummary}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {structureRows.map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-3"
              >
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  {row.label}
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {row.value}
                </div>
                {row.helper ? (
                  <div className="mt-2 text-xs text-zinc-500">{row.helper}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Execution
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                Execution read
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getExecutionToneClasses(
                  executionContext?.executionLabel ?? null
                )}`}
              >
                {executionContext?.executionLabel ?? "Not available"}
              </span>
            </div>

            {executionContext?.executionSummary ? (
              <p className="mt-3 text-sm leading-6 text-zinc-700">
                {executionContext.executionSummary}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Execution context is limited for this setup.
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {executionRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl border border-zinc-200 bg-white p-3"
                >
                  <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                    {row.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    {row.value}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">{row.helper}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}