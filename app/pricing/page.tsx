import Link from "next/link";
import PricingTierCard from "@/components/marketing/PricingTierCard";
import PublicPageIntro from "@/components/marketing/PublicPageIntro";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
      <div className="space-y-8">
        <PublicPageIntro
          eyebrow="Pricing"
          title="Clear pricing for a focused options review workflow"
          description="EntryCheck is built for serious retail users who want faster, more structured premium-selling reviews. The product is intentionally narrow: analyze one ticker, frame the tradeoffs clearly, and keep the result readable."
        />

        <section className="grid gap-4 lg:grid-cols-3">
          <PricingTierCard
            name="Free"
            price="$0/mo"
            description="Get started with the core review workflow. No payment required."
            features={[
              "3 delayed-data reviews/month",
              "1 saved review",
              "1 watchlist ticker",
              "7-day history",
              "Basic verdict, metrics, and risk flags",
            ]}
            ctaLabel="Start free"
            ctaHref="/dashboard"
          />

          <PricingTierCard
            name="Starter"
            price="$15/mo"
            description="For users who want a fuller review workflow without unnecessary complexity."
            features={[
              "10 delayed-data reviews/month",
              "5 watchlist tickers",
              "25 saved reviews",
              "6-month history",
              "Setup comparison",
              "Event risk panel",
              "Data quality panel",
              "Plain-English interpretation",
            ]}
            ctaLabel="Coming soon"
            ctaDisabled
          />

          <PricingTierCard
            name="Pro"
            price="$29/mo"
            description="For users who want a more complete review workspace as richer layers are added."
            features={[
              "15 delayed-data reviews/month",
              "10 watchlist tickers",
              "50 saved reviews",
              "12-month history",
              "Market backdrop panel",
              "Event/catalyst aggregation",
              "Richer evidence layer",
              "Historical setup comparison (coming)",
            ]}
            ctaLabel="Coming soon"
            ctaDisabled
            badge="Primary plan direction"
            emphasized
          />
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm leading-6 text-amber-900">
            <span className="font-semibold">Delayed data notice: </span>
            EntryCheck uses delayed market and options data for setup review. It is not an execution tool. Always confirm live prices, spreads, and availability in your broker before entering a trade.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Who this is for
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Self-directed options sellers who want a more structured review flow than scanning the chain manually every time.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              What it is not
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              This is not a hype-heavy AI picker, a promise engine, a real-time execution tool, or a substitute for deterministic trade logic.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Product direction
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              The commercial path is a focused premium-selling workflow first, with richer review layers added later without changing the core structure.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Before billing goes live
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
              The structure should exist before the payment plumbing does
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              Pricing and packaging are still being finalized. This page is the public commercial shell so the product direction is visible before Stripe and plan enforcement are connected.
            </p>

            <div className="mt-6">
              <Link
                href="/billing"
                className="inline-flex h-11 items-center rounded-xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              >
                View billing shell
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Want to see the workflow first?
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
              Review a sample analysis before worrying about plan choice
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              The best way to understand the product is to see how recommendation, alternatives, risks, and summary are actually framed. The public sample preview is there for exactly that reason.
            </p>

            <div className="mt-6">
              <Link
                href="/sample-analysis"
                className="inline-flex h-11 items-center rounded-xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              >
                View sample analysis
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-zinc-900 px-6 py-10 text-white shadow-sm sm:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Next step
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Start with the workflow before worrying about plan complexity
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">
              The current priority is proving that the analyzer, history, and watchlist loop is useful enough to become a real paid product. The pricing page should reflect that honestly.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
              >
                Open app
              </Link>
              <Link
                href="/sample-analysis"
                className="inline-flex h-11 items-center rounded-xl border border-zinc-700 px-5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
              >
                View sample analysis
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
