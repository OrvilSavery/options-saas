interface AnalyzerLoadingStateProps {
  mode: "explore" | "review";
  ticker: string;
}

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />;
}

export default function AnalyzerLoadingState({ mode, ticker }: AnalyzerLoadingStateProps) {
  return (
    <section className="space-y-3" aria-live="polite" aria-busy="true">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-1.5 bg-slate-200" />
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <Bar className="h-5 w-28" />
            <Bar className="h-3 w-24" />
          </div>
          <Bar className="h-9 w-36" />
          <Bar className="h-4 w-72 max-w-full" />
          <Bar className="h-4 w-full max-w-lg" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="relative h-20 overflow-hidden rounded-lg bg-slate-50">
          <div className="absolute left-4 right-4 top-1/2 h-px bg-slate-200" />
          <Bar className="absolute left-[20%] top-6 h-12 w-px" />
          <Bar className="absolute left-[36%] top-5 h-14 w-px" />
          <Bar className="absolute left-[74%] top-4 h-16 w-px" />
        </div>
      </div>

      <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-b border-slate-100 p-4 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <Bar className="h-3 w-14" />
            <Bar className="mt-3 h-5 w-20" />
            <Bar className="mt-3 h-3 w-16" />
          </div>
        ))}
      </div>

      <p className="text-center text-[13px] text-slate-400">
        Analyzing {ticker?.trim() ? ticker.toUpperCase() : "setup"} in {mode === "review" ? "Review mode" : "Find setups"}...
      </p>
    </section>
  );
}
