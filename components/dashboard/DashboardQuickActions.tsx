import Link from "next/link";

export default function DashboardQuickActions() {
  const actions = [
    {
      href: "/analyzer",
      title: "Run analyzer",
      description: "Start a new structured review for one ticker.",
      primary: true,
    },
    {
      href: "/history",
      title: "Open history",
      description: "Review saved analyses and revisit prior setups.",
      primary: false,
    },
    {
      href: "/watchlist",
      title: "Open watchlist",
      description: "Revisit saved names and jump back into analysis.",
      primary: false,
    },
  ];

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Quick actions
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`rounded-2xl border p-5 transition ${
              action.primary
                ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
                : "border-zinc-200 bg-zinc-50 text-zinc-950 hover:border-zinc-300 hover:bg-white"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                action.primary ? "text-white" : "text-zinc-950"
              }`}
            >
              {action.title}
            </p>
            <p
              className={`mt-2 text-sm leading-6 ${
                action.primary ? "text-zinc-300" : "text-zinc-600"
              }`}
            >
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}