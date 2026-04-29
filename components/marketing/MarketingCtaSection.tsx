import Link from "next/link";

export default function MarketingCtaSection() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-10 shadow-sm sm:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Next step
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Start with the workflow that matters most
        </h2>
        <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
          The current priority is proving that a structured premium-selling review workflow is useful enough to become a real paid product. That means keeping the app narrow, readable, and increasingly credible as it grows.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
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