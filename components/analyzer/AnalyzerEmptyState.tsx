export default function AnalyzerEmptyState() {
  return (
    <section className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-6">
      <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-md text-center">
          <p className="text-sm font-medium text-slate-400">
            Enter a ticker to see your first setup review.
          </p>

          <div className="relative mx-auto mt-8 h-20 max-w-sm">
            <div className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
            <div className="absolute left-[18%] top-1/2 h-8 w-px -translate-y-1/2 bg-slate-300" />
            <div className="absolute left-[18%] top-[calc(50%+14px)] h-2 w-2 -translate-x-1/2 rounded-full bg-slate-300" />
            <div className="absolute left-[35%] top-1/2 h-10 w-px -translate-y-1/2 bg-slate-300" />
            <div className="absolute left-[35%] top-[calc(50%+18px)] h-2 w-2 -translate-x-1/2 rounded-full bg-slate-300" />
            <div className="absolute left-[75%] top-1/2 h-12 w-px -translate-y-1/2 bg-slate-400" />
            <div className="absolute left-[75%] top-[calc(50%+20px)] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-slate-400" />
            <div className="absolute left-[18%] top-[calc(50%+26px)] font-mono text-[10px] font-semibold text-slate-300">520</div>
            <div className="absolute left-[35%] top-[calc(50%-32px)] font-mono text-[10px] font-semibold text-slate-300">525</div>
            <div className="absolute left-[75%] top-[calc(50%-34px)] rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-400">$542</div>
          </div>
        </div>
      </div>
    </section>
  );
}
