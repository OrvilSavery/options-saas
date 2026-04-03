interface RiskCardProps {
  risks: string[];
  explanation: string;
}

export default function RiskCard({ risks, explanation }: RiskCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-zinc-900 mb-3">Risks</h3>
      {risks.length > 0 ? (
        <ul className="space-y-1.5 mb-4">
          {risks.map((risk, i) => (
            <li key={i} className="text-sm text-zinc-600 flex gap-2">
              <span className="text-zinc-400 shrink-0">•</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-400 mb-4">No specific risks flagged.</p>
      )}
      {explanation && (
        <div className="border-t border-zinc-100 pt-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            Summary
          </span>
          <p className="text-sm text-zinc-600 mt-1 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
