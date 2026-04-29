import Link from "next/link";
import MarketingHero from "@/components/marketing/MarketingHero";
import MarketingFeatureGrid from "@/components/marketing/MarketingFeatureGrid";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import ProductPrinciplesSection from "@/components/marketing/ProductPrinciplesSection";
import MarketingCtaSection from "@/components/marketing/MarketingCtaSection";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
      <div className="space-y-8">
        <MarketingHero />

        <MarketingFeatureGrid />

        <HowItWorksSection />

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Pricing
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
                Simple pricing structure, without premature plan complexity
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
                The pricing direction stays intentionally focused while the product proves the analyzer, history, and watchlist workflow. The point is clarity first, not overbuilt packaging.
              </p>

              <div className="mt-6">
                <Link
                  href="/pricing"
                  className="inline-flex h-11 items-center rounded-xl border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Product preview
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
                See a sample analyzer result before going into the app
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
                The product is easier to understand when the output is visible. The sample page shows how recommendation, alternatives, risks, and summary are framed without turning the public site into a live tool.
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
          </div>
        </section>

        <ProductPrinciplesSection />

        <MarketingCtaSection />
      </div>
    </main>
  );
}