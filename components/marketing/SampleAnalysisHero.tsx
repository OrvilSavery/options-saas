import Link from "next/link";

export default function SampleAnalysisHero() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-12 shadow-sm sm:px-10">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Sample analysis
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          A public preview of the structured analyzer workflow
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg">
          This page shows a static example of what a saved analyzer output can look like inside the product. The goal is to show the workflow clearly, not to present live market data as public advice.
        </p>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500">
          The real app is built around recommendation first, supporting context second, and visible tradeoffs throughout. This preview is meant to make that concrete.
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