export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Run one ticker through the analyzer",
      description:
        "Start with a single stock or ETF and review the setup through a narrow, structured workflow instead of bouncing between disconnected screens.",
    },
    {
      step: "02",
      title: "Review the recommendation and tradeoffs",
      description:
        "The analyzer returns a top-ranked setup, alternatives, and visible risks so the decision reads like a review process rather than a raw output dump.",
    },
    {
      step: "03",
      title: "Save, revisit, and compare over time",
      description:
        "Saved history and watchlist flows make the product useful beyond one screen. You can review prior runs, revisit names, and build workflow continuity.",
    },
  ];

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          A narrow workflow, built to become more useful over time
        </h2>
        <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
          The product direction is intentionally focused. Build the core analyzer loop first, then layer in richer review features later without changing the foundation.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.step}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Step {step.step}
            </p>
            <h3 className="mt-3 text-lg font-semibold text-zinc-950">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}