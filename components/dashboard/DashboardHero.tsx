interface DashboardHeroProps {
  email?: string | null;
}

export default function DashboardHero({ email }: DashboardHeroProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Dashboard
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Your structured review workspace
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base">
          This is the home screen for the analyzer workflow. Run a ticker, revisit saved analyses, and keep a focused watchlist without adding unnecessary clutter.
        </p>

        <div className="mt-5 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          <p className="font-medium text-zinc-900">Signed in</p>
          <p className="mt-1 break-all">{email ?? "Email unavailable"}</p>
        </div>
      </div>
    </section>
  );
}