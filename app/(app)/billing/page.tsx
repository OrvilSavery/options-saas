import type { ReactNode } from "react";
import { ensureUserRecord } from "@/lib/auth";

function Feature({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <li className={`flex gap-2 text-sm leading-6 ${muted ? "text-zinc-400" : "text-zinc-700"}`}>
      <span className={muted ? "text-zinc-400" : "font-semibold text-emerald-500"}>{muted ? "—" : "✓"}</span>
      <span>{children}</span>
    </li>
  );
}

function ProFeature({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 text-sm leading-6 text-white">
      <span className="font-semibold text-emerald-400">✓</span>
      <span>{children}</span>
    </li>
  );
}

function SummaryTile({ label, value, accent = false }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${accent ? "text-emerald-600" : "text-zinc-950"}`}>{value}</p>
    </div>
  );
}

export default async function BillingPage() {
  const user = await ensureUserRecord();
  const email = user?.email ?? "—";

  return (
    <div className="mx-auto max-w-[740px] space-y-4">
      <header className="pt-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Billing</h1>
        <p className="mt-1 text-sm text-zinc-600">Manage your plan and payment details.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Current subscription</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <SummaryTile label="Plan" value="Starter" />
          <SummaryTile label="Status" value="Active" accent />
          <SummaryTile label="Usage today" value="—" />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="relative rounded-2xl border-2 border-emerald-400 bg-white p-6 shadow-sm">
          <span className="absolute right-4 top-0 -translate-y-px rounded-b-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Current plan
          </span>
          <h2 className="text-xl font-semibold text-zinc-950">Free</h2>
          <div className="mt-2 flex items-end gap-1">
            <span className="font-mono text-3xl font-semibold tracking-tight text-zinc-950">$0</span>
            <span className="pb-1 text-sm text-zinc-500">/ month</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-600">Get started with the core delayed-data review workflow.</p>

          <ul className="mt-5 space-y-1">
            <Feature>3 delayed-data reviews/month</Feature>
            <Feature>1 saved review</Feature>
            <Feature>1 watchlist ticker</Feature>
            <Feature>7-day history</Feature>
            <Feature>Basic verdict, metrics, and risk flags</Feature>
          </ul>

          <button
            type="button"
            disabled
            className="mt-6 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-600"
          >
            Current plan
          </button>
        </div>

        <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">Starter</h2>
          <div className="mt-2 flex items-end gap-1">
            <span className="font-mono text-3xl font-semibold tracking-tight text-zinc-950">$15</span>
            <span className="pb-1 text-sm text-zinc-500">/ month</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-600">Fuller review workflow for active users.</p>

          <ul className="mt-5 space-y-1">
            <Feature>10 delayed-data reviews/month</Feature>
            <Feature>5 watchlist tickers</Feature>
            <Feature>25 saved reviews</Feature>
            <Feature>6-month history</Feature>
            <Feature>Setup comparison</Feature>
            <Feature>Event risk panel</Feature>
            <Feature>Data quality panel</Feature>
            <Feature>Plain-English interpretation</Feature>
          </ul>

          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-400"
          >
            Coming soon
          </button>
        </div>

        <div className="relative rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <span className="absolute right-4 top-0 -translate-y-px rounded-b-md bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            Primary plan
          </span>
          <h2 className="text-xl font-semibold">Pro</h2>
          <div className="mt-2 flex items-end gap-1">
            <span className="font-mono text-3xl font-semibold tracking-tight">$29</span>
            <span className="pb-1 text-sm text-slate-400">/ month</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">Complete review workspace for regular premium sellers.</p>

          <ul className="mt-5 space-y-1">
            <ProFeature>15 delayed-data reviews/month</ProFeature>
            <ProFeature>10 watchlist tickers</ProFeature>
            <ProFeature>50 saved reviews</ProFeature>
            <ProFeature>12-month history</ProFeature>
            <ProFeature>Market backdrop panel</ProFeature>
            <ProFeature>Event/catalyst aggregation</ProFeature>
            <ProFeature>Richer evidence layer</ProFeature>
            <ProFeature>Historical setup comparison (coming)</ProFeature>
          </ul>

          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-300"
          >
            Coming soon
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm leading-6 text-amber-900">
          <span className="font-semibold">Delayed data notice: </span>
          EntryCheck uses delayed market and options data for setup review. It is not an execution tool. Always confirm live prices, spreads, and availability in your broker before entering a trade.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Billing details</p>
        <div className="mt-4 divide-y divide-zinc-100 text-sm">
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-zinc-600">Payment method</span>
            <span className="font-medium text-zinc-950">None added <span className="ml-2 text-sm text-zinc-400">(coming soon)</span></span>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-zinc-600">Next billing date</span>
            <span className="font-medium text-zinc-950">—</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-zinc-600">Billing email</span>
            <span className="font-medium text-zinc-950">{email}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Common questions</p>
        <div className="mt-5 divide-y divide-zinc-100">
          <div className="py-3">
            <h3 className="text-sm font-semibold text-zinc-950">Can I cancel anytime?</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">Yes. Cancel from this page anytime. You’ll keep Pro access until the end of your billing period.</p>
          </div>
          <div className="py-3">
            <h3 className="text-sm font-semibold text-zinc-950">What happens when I hit my monthly review limit?</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">You’ll see a message that you’ve used your delayed-data reviews for the month. Limits reset monthly. Upgrade to a higher plan for more reviews.</p>
          </div>
          <div className="py-3">
            <h3 className="text-sm font-semibold text-zinc-950">Is this financial advice?</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">No. EntryCheck is a structural review tool. It evaluates setup quality using rules-based analysis. It does not recommend trades or predict outcomes.</p>
          </div>
        </div>
      </section>

      <p className="pb-8 text-center text-xs text-zinc-300">All prices in USD. Subscriptions are handled securely through Stripe.</p>
    </div>
  );
}
