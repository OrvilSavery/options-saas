import type { ComparedSetup, SetupEvidence } from "@/types/analysis";

interface SetupDetailsPanelProps {
  selectedSetup: ComparedSetup | null;
  setupContext: SetupEvidence | null;
  reviewLabel: string;
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  return `${(value * 100).toFixed(1)}%`;
}

function formatWhole(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  return `${Math.round(value)}`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function SetupDetailsPanel({ selectedSetup, setupContext, reviewLabel }: SetupDetailsPanelProps) {
  const shortStrike = selectedSetup?.shortStrike ?? setupContext?.shortStrike ?? null;
  const longStrike = selectedSetup?.longStrike ?? setupContext?.longStrike ?? null;
  const width = selectedSetup?.width ?? setupContext?.width ?? null;
  const dte = selectedSetup?.daysToExpiration ?? setupContext?.daysToExpiration ?? null;
  const premium = selectedSetup?.premium ?? null;
  const returnOnRisk = selectedSetup?.returnOnRisk ?? null;
  const room = selectedSetup?.downsideRoom ?? setupContext?.downsideRoom ?? null;
  const expiration = selectedSetup?.expiration ?? null;

  const fields: Array<{ label: string; value: string | null }> = [
    { label: "Short strike", value: formatWhole(shortStrike) },
    { label: "Long strike", value: formatWhole(longStrike) },
    { label: "Width", value: width != null ? `$${width.toFixed(0)} wide` : null },
    { label: "DTE", value: formatWhole(dte) },
    { label: "Premium", value: formatCurrency(premium) },
    { label: "Return on risk", value: formatPercent(returnOnRisk) },
    { label: "Room", value: formatPercent(room) },
    { label: "Expiration", value: expiration },
  ];
  const visibleFields = fields.filter((field): field is { label: string; value: string } => Boolean(field.value));

  const context = selectedSetup?.note || setupContext?.setupSummary || null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{reviewLabel}</p>
        <h4 className="mt-1 text-sm font-semibold text-slate-900">Setup context</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {context || "Use these details as a reference when comparing the selected setup against nearby strikes."}
        </p>
      </div>

      {visibleFields.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {visibleFields.map((field) => <Field key={field.label} label={field.label} value={field.value} />)}
        </div>
      ) : null}
    </div>
  );
}
