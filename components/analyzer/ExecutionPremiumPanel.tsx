import type { ComparedSetup, ExecutionEvidence, VolatilityPremiumEvidence } from "@/types/analysis";

interface ExecutionPremiumPanelProps {
  selectedSetup: ComparedSetup | null;
  executionContext: ExecutionEvidence | null;
  volatilityPremiumContext: VolatilityPremiumEvidence | null;
  reviewLabel: string;
  isMainSetup?: boolean;
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  return `$${value.toFixed(2)}`;
}

function formatWhole(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.round(value).toLocaleString("en-US");
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  return `${(value * 100).toFixed(1)}%`;
}

function DetailCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "warning" }) {
  const toneClass = tone === "good" ? "text-emerald-700" : tone === "warning" ? "text-amber-700" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function ExecutionPremiumPanel({ selectedSetup, executionContext, volatilityPremiumContext, reviewLabel }: ExecutionPremiumPanelProps) {
  if (!selectedSetup && !executionContext && !volatilityPremiumContext) {
    return <p className="text-sm leading-6 text-slate-500">Execution details are not available for this review.</p>;
  }

  const executionLabel = selectedSetup?.executionLabel ?? executionContext?.executionLabel ?? null;
  const bidAskWidth = selectedSetup?.bidAskWidth ?? executionContext?.bidAskWidth ?? null;
  const volume = selectedSetup?.volume ?? executionContext?.volume ?? null;
  const openInterest = selectedSetup?.openInterest ?? executionContext?.openInterest ?? null;
  const returnOnRisk = selectedSetup?.returnOnRisk ?? volatilityPremiumContext?.premiumToRiskPercent ?? null;
  const premiumSummary = volatilityPremiumContext?.summary ?? null;
  const executionSummary = executionContext?.executionSummary ?? null;

  const cards: Array<{ label: string; value: string; tone?: "neutral" | "good" | "warning" }> = [];
  if (executionLabel) cards.push({ label: "Execution", value: executionLabel, tone: executionLabel === "Clean" || executionLabel === "Usable" ? "good" : "warning" });
  const returnOnRiskText = formatPercent(returnOnRisk);
  if (returnOnRiskText) cards.push({ label: "Return on risk", value: returnOnRiskText, tone: returnOnRisk != null && returnOnRisk >= 0.18 ? "good" : "warning" });
  const bidAskText = formatCurrency(bidAskWidth);
  if (bidAskText) cards.push({ label: "Bid/ask width", value: bidAskText });
  const volumeText = formatWhole(volume);
  if (volumeText) cards.push({ label: "Volume", value: volumeText });
  const openInterestText = formatWhole(openInterest);
  if (openInterestText) cards.push({ label: "Open interest", value: openInterestText });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{reviewLabel}</p>
        <h4 className="mt-1 text-sm font-semibold text-slate-900">Execution and premium</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {executionSummary || premiumSummary || "Review the available execution and return data before deciding whether the credit is worth the tradeoff."}
        </p>
      </div>

      {cards.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => <DetailCard key={card.label} {...card} />)}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Some execution inputs are not available for this review.
        </p>
      )}
    </div>
  );
}
