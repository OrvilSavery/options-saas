import type { TrackedSetupDiff } from "@/types/trackedSetup";

interface TrackedSetupDiffCardProps {
  diff: TrackedSetupDiff;
}

function postureClasses(posture: TrackedSetupDiff["currentPosture"]) {
  switch (posture) {
    case "valid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "watchlist":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "pass":
    default:
      return "border-red-200 bg-red-50 text-red-700";
  }
}

export default function TrackedSetupDiffCard({
  diff,
}: TrackedSetupDiffCardProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
          Tracked setup
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${postureClasses(
            diff.currentPosture
          )}`}
        >
          {diff.currentPosture}
        </span>
      </div>

      <h3 className="mt-3 text-xl font-semibold text-zinc-950">
        {diff.ticker} · {diff.setupLabel}
      </h3>
      <p className="mt-1 text-sm text-zinc-600">{diff.strategy}</p>

      <p className="mt-4 text-sm leading-6 text-zinc-800">{diff.summary}</p>

      <ul className="mt-4 space-y-2">
        {diff.bulletDiffs.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm leading-6 text-zinc-800"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
