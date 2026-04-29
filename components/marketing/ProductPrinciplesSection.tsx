export default function ProductPrinciplesSection() {
  const principles = [
    {
      title: "Rules compute the result",
      description:
        "Deterministic logic should control the real analysis framework, not free-form AI output.",
    },
    {
      title: "AI improves readability",
      description:
        "The explanation layer should make the output easier to understand, not invent unsupported precision.",
    },
    {
      title: "Structured beats flashy",
      description:
        "The interface is meant to feel calm, credible, and useful, not like a cluttered trading terminal or a generic AI landing page.",
    },
    {
      title: "Upgrade path matters",
      description:
        "The product is being built so richer modules can be added later without forcing a rewrite of the core workflow.",
    },
  ];

  return (
    <section className="rounded-3xl border border-zinc-200 bg-zinc-900 px-6 py-10 text-white shadow-sm sm:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Product principles
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          The product should feel grounded before it feels advanced
        </h2>
        <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">
          This product is being built for a real commercial path, not as a flashy demo. The architecture and interface are meant to support that from the start.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {principles.map((principle) => (
          <div
            key={principle.title}
            className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5"
          >
            <p className="text-sm font-semibold text-white">{principle.title}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {principle.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}