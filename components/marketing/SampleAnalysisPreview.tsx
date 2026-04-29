import { MOCK_EXPIRATION } from "@/lib/analyzer/mockData";

const { dateStr, label } = MOCK_EXPIRATION;

export default function SampleAnalysisPreview() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-end gap-3">
              <h2 className="text-2xl font-semibold text-zinc-950">SPY</h2>
              <span className="pb-0.5 text-sm text-zinc-500">$542.31</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Static sample preview of a structured analyzer result
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Event risk: low
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Valid setup
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Market condition
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Neutral to slightly bullish with recent consolidation above support.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Volatility condition
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Premium environment is moderate. Rich enough to support a defined-risk short premium setup, but not unusually elevated.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Top-ranked strategy
            </h3>
            <p className="mt-2 text-xl font-semibold text-zinc-950">Put Credit Spread</p>
            <p className="mt-1 text-sm font-medium text-zinc-700">
              SPY {label} 518/513 Put Credit Spread
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            <p>
              Expiration: <span className="font-medium text-zinc-900">{dateStr}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Premium
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-950">$1.42</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Return on risk
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-950">39.0%</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Why it ranked first
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            This setup balances premium capture, defined risk, and workable downside room without forcing a more aggressive strike. It reads as a cleaner fit than the closer short strike alternative.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Alternatives
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Safer alternative
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              SPY {label} 510/505 Put Credit Spread
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Lower premium, but offers more room and a more defensive posture.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              More aggressive alternative
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-950">
              SPY {label} 524/519 Put Credit Spread
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Higher premium, but the short strike sits closer to price and carries more breach risk.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Risks and summary
        </h3>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Main risks
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-2 text-sm leading-6 text-zinc-700">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                <span>A broad market selloff could test the short strike quickly.</span>
              </li>
              <li className="flex gap-2 text-sm leading-6 text-zinc-700">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                <span>Premium is moderate, so the setup does not offer an unusually large cushion.</span>
              </li>
              <li className="flex gap-2 text-sm leading-6 text-zinc-700">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                <span>A volatility expansion could pressure the spread before expiration.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Structured summary
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              SPY reads as a valid defined-risk premium-selling setup in this sample. The selected spread is not the highest premium option, but it is the cleaner balance between income and room. The overall posture is constructive, but not aggressive.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
