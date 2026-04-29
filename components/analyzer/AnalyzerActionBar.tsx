import WatchlistAddButton from "@/components/watchlist/WatchlistAddButton";

interface AnalyzerActionBarProps {
  ticker: string;
  historySaveStatus: "idle" | "saving" | "saved" | "failed";
}

function historyLabel(status: AnalyzerActionBarProps["historySaveStatus"]) {
  switch (status) {
    case "idle":
      return "Analysis is ready";
    case "saving":
      return "Saving to history...";
    case "saved":
      return "Saved to history";
    case "failed":
      return "History save failed";
  }
}

function historyClasses(status: AnalyzerActionBarProps["historySaveStatus"]) {
  switch (status) {
    case "idle":
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
    case "saving":
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
    case "saved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default function AnalyzerActionBar({
  ticker,
  historySaveStatus,
}: AnalyzerActionBarProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${historyClasses(
            historySaveStatus
          )}`}
        >
          {historyLabel(historySaveStatus)}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <WatchlistAddButton ticker={ticker} />
        </div>
      </div>
    </section>
  );
}