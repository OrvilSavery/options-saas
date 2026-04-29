interface RiskCardProps {
  risks: string[];
  explanation: string;
}

export default function RiskCard({ risks, explanation }: RiskCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Risks and summary</h3>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Main risks</p>

          {risks.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {risks.map((risk) => (
                <li key={risk} className="flex gap-2 text-sm leading-6 text-zinc-700">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No specific risks flagged.</p>
          )}
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Structured summary</p>
          <p className="mt-3 text-sm leading-6 text-zinc-700">{explanation}</p>
        </div>
      </div>
    </section>
  );
}