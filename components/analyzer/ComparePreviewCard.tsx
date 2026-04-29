import type { ComparedSetup, TradeQualityBand } from "@/types/analysis";
import CompareSetupMiniRail from "@/components/analyzer/CompareSetupMiniRail";

interface ComparePreviewCardProps {
  variant: "safer" | "current" | "higher_premium";
  title: string;
  currentPrice: number;
  setup: ComparedSetup | null;
  emptyNote: string;
  isSelected: boolean;
  onSelect: () => void;
}

function shellClasses(
  variant: ComparePreviewCardProps["variant"],
  isSelected: boolean
) {
  const base =
    "rounded-[22px] border bg-white text-zinc-900 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md";

  if (isSelected) {
    switch (variant) {
      case "current":
        return `${base} border-zinc-900 ring-2 ring-zinc-200 ring-offset-2`;
      case "safer":
        return `${base} border-emerald-400 ring-2 ring-emerald-100 ring-offset-2`;
      case "higher_premium":
        return `${base} border-rose-400 ring-2 ring-rose-100 ring-offset-2`;
    }
  }

  switch (variant) {
    case "current":
      return `${base} border-zinc-200 hover:border-zinc-400`;
    case "safer":
      return `${base} border-zinc-200 hover:border-emerald-300`;
    case "higher_premium":
      return `${base} border-zinc-200 hover:border-rose-300`;
  }
}

function badgeClasses(
  variant: ComparePreviewCardProps["variant"],
  isSelected: boolean
) {
  if (isSelected) {
    switch (variant) {
      case "current":
        return "border-zinc-200 bg-zinc-100 text-zinc-800";
      case "safer":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "higher_premium":
        return "border-rose-200 bg-rose-50 text-rose-700";
    }
  }

  switch (variant) {
    case "current":
      return "border-zinc-200 bg-white text-zinc-600";
    case "safer":
      return "border-emerald-100 bg-emerald-50/50 text-emerald-700";
    case "higher_premium":
      return "border-rose-100 bg-rose-50/50 text-rose-700";
  }
}

function bandClasses(band: TradeQualityBand | null) {
  if (!band) {
    return "border-zinc-200 bg-white text-zinc-700";
  }

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

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function buildTradeoffLine(
  variant: ComparePreviewCardProps["variant"],
  setup: ComparedSetup
) {
  const room = setup.downsideRoom ?? null;
  const premium = setup.premium ?? null;
  const execution = setup.executionLabel ?? null;

  if (variant === "safer") {
    if (room != null && premium != null) {
      return `More room at ${formatPercent(room)} with lighter credit at ${formatCurrency(
        premium
      )}.`;
    }

    if (execution === "Limited" || execution === "Tight") {
      return "Safer placement, but execution still needs a closer look.";
    }

    return "Built for more room before pressure builds.";
  }

  if (variant === "higher_premium") {
    if (room != null && premium != null) {
      return `More credit at ${formatCurrency(
        premium
      )} with tighter room at ${formatPercent(room)}.`;
    }

    if (execution === "Limited" || execution === "Tight") {
      return "Higher premium here, but fills may matter more than usual.";
    }

    return "Built for richer premium with tighter structure placement.";
  }

  if (room != null && premium != null) {
    return `Current setup: ${formatCurrency(premium)} premium with ${formatPercent(
      room
    )} downside room.`;
  }

  if (execution === "Limited" || execution === "Tight") {
    return "Execution still looks less forgiving for this setup.";
  }

  return "This is the setup selected for review.";
}

function actionLabel(
  variant: ComparePreviewCardProps["variant"],
  isSelected: boolean
) {
  if (isSelected) return "Reviewing";

  switch (variant) {
    case "safer":
      return "Review safer";
    case "higher_premium":
      return "Review richer";
    case "current":
    default:
      return "Review";
  }
}

export default function ComparePreviewCard({
  variant,
  title,
  currentPrice,
  setup,
  emptyNote,
  isSelected,
  onSelect,
}: ComparePreviewCardProps) {
  if (!setup) {
    return (
      <article className={shellClasses(variant, false)}>
        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {title}
          </p>
          <h4 className="mt-2 text-sm font-semibold text-zinc-950">
            Not available
          </h4>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{emptyNote}</p>
        </div>
      </article>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${shellClasses(variant, isSelected)} w-full p-4 text-left`}
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {title}
          </p>
          <h4 className="mt-1.5 text-sm font-semibold text-zinc-950">
            {setup.setupLabel}
          </h4>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            {setup.strategy}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${bandClasses(
              setup.tradeQualityBand
            )}`}
          >
            {setup.tradeQualityBand ?? "Compared"}
          </span>

          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${badgeClasses(
              variant,
              isSelected
            )}`}
          >
            {actionLabel(variant, isSelected)}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <CompareSetupMiniRail
          currentPrice={currentPrice}
          shortStrike={setup.shortStrike}
          longStrike={setup.longStrike}
          expectedMoveLow={setup.expectedMoveLow}
          expectedMoveHigh={setup.expectedMoveHigh}
          variant={variant}
        />
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-600">
        {buildTradeoffLine(variant, setup)}
      </p>
    </button>
  );
}