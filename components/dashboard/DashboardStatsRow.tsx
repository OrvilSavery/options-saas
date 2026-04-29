interface DashboardStatsRowProps {
  totalAnalysisCount: number;
  totalWatchlistCount: number;
}

export default function DashboardStatsRow({
  totalAnalysisCount,
  totalWatchlistCount,
}: DashboardStatsRowProps) {
  const stats = [
    {
      label: "Saved analyses",
      value: totalAnalysisCount,
      description: "Total analyzer runs saved to history.",
    },
    {
      label: "Watchlist items",
      value: totalWatchlistCount,
      description: "Saved tickers available to reopen in the analyzer.",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {stat.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950">{stat.value}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{stat.description}</p>
        </div>
      ))}
    </section>
  );
}