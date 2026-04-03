import type { Alternative } from "@/types/analysis";

interface AlternativesCardProps {
  saferAlternative: Alternative | null;
  aggressiveAlternative: Alternative | null;
}

function AlternativeBlock({ label, alt }: { label: string; alt: Alternative }) {
  return (
    <div>
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
      <p className="text-sm font-medium text-zinc-900 mt-1">{alt.setupLabel}</p>
      <p className="text-sm text-zinc-600 mt-0.5 leading-relaxed">{alt.note}</p>
    </div>
  );
}

export default function AlternativesCard({
  saferAlternative,
  aggressiveAlternative,
}: AlternativesCardProps) {
  if (!saferAlternative && !aggressiveAlternative) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-2">Alternatives</h3>
        <p className="text-sm text-zinc-400">No alternatives available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-zinc-900 mb-3">Alternatives</h3>
      <div className="space-y-4">
        {saferAlternative && (
          <AlternativeBlock label="Safer" alt={saferAlternative} />
        )}
        {aggressiveAlternative && (
          <AlternativeBlock label="Aggressive" alt={aggressiveAlternative} />
        )}
      </div>
    </div>
  );
}
