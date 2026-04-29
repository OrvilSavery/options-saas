import Link from "next/link";
import PublicPageIntro from "@/components/marketing/PublicPageIntro";
import SampleAnalysisPreview from "@/components/marketing/SampleAnalysisPreview";

export default function SampleAnalysisPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
      <div className="space-y-8">
        <PublicPageIntro
          eyebrow="Sample analysis"
          title="A public preview of the structured analyzer workflow"
          description="This page shows a static example of what a saved analyzer output can look like inside the product. The goal is to show the workflow clearly, not to present live market data as public advice."
        />

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <SampleAnalysisPreview />
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                What this preview shows
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                This sample is meant to show how the product frames one setup clearly: recommendation first, then alternatives, risks, and context.
              </p>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                What it does not show
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                This page is static. It is not a live chain, not a public trade recommendation engine, and not a substitute for the signed-in analyzer workflow.
              </p>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Why this matters
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                A product like this should feel readable and trustworthy before it feels dense. The sample preview helps set that expectation publicly.
              </p>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Where to go next
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex h-11 items-center rounded-xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
                >
                  View pricing
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Open app
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}