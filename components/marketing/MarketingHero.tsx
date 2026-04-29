import Link from "next/link";

export default function MarketingHero() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-12 shadow-sm sm:px-10">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Structured options analysis
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Review premium-selling options setups before entry.
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg">
          EntryCheck helps self-directed options sellers review one ticker at a time through a structured analyzer workflow. The goal is not more noise. The goal is a cleaner recommendation, clearer tradeoffs, and more visible risk.
        </p>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500">
          Rules compute the result. AI explains the result. The product stays grounded, readable, and focused on premium-selling setups instead of generic market commentary.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Open app
          </Link>

          <Link
            href="/pricing"
            className="inline-flex h-11 items-center rounded-xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}