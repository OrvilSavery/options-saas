import type { Alternative } from "@/types/analysis";

interface AlternativesCardProps {
  saferAlternative: Alternative | null;
  aggressiveAlternative: Alternative | null;
}

function AlternativeBlock({ title, alt }: { title: string; alt: Alternative }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{title}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-950">{alt.setupLabel}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{alt.note}</p>
    </div>
  );
}

export default function AlternativesCard({
  saferAlternative,
  aggressiveAlternative,
}: AlternativesCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Alternatives</h3>

      {!saferAlternative && !aggressiveAlternative ? (
        <p className="mt-3 text-sm text-zinc-500">No additional alternatives are available right now.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {saferAlternative ? (
            <AlternativeBlock title="Safer alternative" alt={saferAlternative} />
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-400">
              No safer alternative flagged.
            </div>
          )}

          {aggressiveAlternative ? (
            <AlternativeBlock title="More aggressive alternative" alt={aggressiveAlternative} />
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-400">
              No aggressive alternative flagged.
            </div>
          )}
        </div>
      )}
    </section>
  );
}