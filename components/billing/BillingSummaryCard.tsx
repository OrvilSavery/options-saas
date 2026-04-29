interface BillingSummaryCardProps {
  currentPlan: string;
  billingStatus: string;
  renewalText: string;
}

export default function BillingSummaryCard({
  currentPlan,
  billingStatus,
  renewalText,
}: BillingSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Current billing status
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Current plan
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-950">{currentPlan}</p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Billing status
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-950">{billingStatus}</p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Renewal
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-950">{renewalText}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-600">
        Billing infrastructure is not live yet. This page is the shell for the future subscription experience so the app structure is ready before Stripe and plan enforcement are added.
      </p>
    </section>
  );
}