import type {
  PremiumEnvironmentLabel,
  VolatilityContextLabel,
  VolatilityPremiumEvidence,
} from "@/types/analysis";

interface VolatilityPremiumContextCardProps {
  context: VolatilityPremiumEvidence | null;
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

function getToneClasses(
  label: PremiumEnvironmentLabel | VolatilityContextLabel | null
): string {
  switch (label) {
    case "Supportive":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Neutral":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Less supportive":
    case "Less favorable":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

export default function VolatilityPremiumContextCard({
  context,
}: VolatilityPremiumContextCardProps) {
  if (!context) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Premium / volatility context
        </h3>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">
          A bounded read on whether current premium conditions look supportive
          for a defined-risk credit structure. This supports the review without
          replacing it.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            Premium environment
          </div>
          <div className="mt-3">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getToneClasses(
                context.premiumEnvironmentLabel
              )}`}
            >
              {context.premiumEnvironmentLabel ?? "Not available"}
            </span>
          </div>
          <div className="mt-3 text-xs text-zinc-500">
            Frames whether the current credit looks supportive relative to
            defined risk.
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            Volatility context
          </div>
          <div className="mt-3">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getToneClasses(
                context.volatilityContextLabel
              )}`}
            >
              {context.volatilityContextLabel ?? "Not available"}
            </span>
          </div>
          <div className="mt-3 text-xs text-zinc-500">
            Uses current analyzer-owned volatility context rather than a new
            scoring model.
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            Supporting read
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            {context.summary ??
              "Premium and volatility context is limited for this setup."}
          </p>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3">
            <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Return on risk
            </div>
            <div className="mt-1 text-sm font-semibold text-zinc-900">
              {formatPercent(context.premiumToRiskPercent)}
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Included as a compact supporting metric, not as a new ranking
              rule.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}