export default function MarketingFeatureGrid() {
  const items = [
    {
      title: "Recommendation first",
      description:
        "The product is designed to surface the top-line setup clearly before drowning the user in supporting detail.",
    },
    {
      title: "Tradeoffs made visible",
      description:
        "A safer alternative and a more aggressive alternative help frame the real compromise between premium and cushion.",
    },
    {
      title: "Risk stays explicit",
      description:
        "The workflow is meant to make event risk, setup weakness, and main failure points visible instead of hiding them behind a polished summary.",
    },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {item.title}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {item.description}
          </p>
        </div>
      ))}
    </section>
  );
}