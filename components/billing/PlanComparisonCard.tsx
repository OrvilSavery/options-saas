import Link from "next/link";

export default function PlanComparisonCard() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Plan comparison
        </p>
        <Link
          href="/pricing"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
        >
          View pricing page
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-950">Starter</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Positioned for users who want the structured analyzer workflow without unnecessary complexity.
          </p>
          <ul className="mt-4 space-y-2">
            {[
              "Analyzer workflow",
              "Saved history",
              "Watchlist workflow",
              "Core review experience",
            ].map((feature) => (
              <li key={feature} className="flex gap-2 text-sm text-zinc-700">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-4 text-white">
          <p className="text-sm font-semibold">Pro</p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Positioned as the long-term primary plan for users who rely on the app more regularly.
          </p>
          <ul className="mt-4 space-y-2">
            {[
              "Everything in Starter",
              "Priority access to richer layers later",
              "Deeper review workflow over time",
              "Long-term primary commercial direction",
            ].map((feature) => (
              <li key={feature} className="flex gap-2 text-sm text-zinc-100">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}