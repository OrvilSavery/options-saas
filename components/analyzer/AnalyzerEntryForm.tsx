"use client";

import { useState, type ReactNode } from "react";
import type {
  AnalyzeMode,
  AnalyzeRequest,
  RequestedStrategyType,
} from "@/lib/analyzer/types/analyzeRequest";
import { MOCK_EXPIRATION } from "@/lib/analyzer/mockData";

interface AnalyzerEntryFormProps {
  value: AnalyzeRequest;
  onChange: (next: AnalyzeRequest) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isCollapsed?: boolean;
  onExpand?: () => void;
  summary?: string;
}

const strategyOptions: Array<{
  value: RequestedStrategyType;
  label: string;
}> = [
  { value: "put_credit_spread", label: "Put credit spread" },
  { value: "call_credit_spread", label: "Call credit spread" },
];

function updateField<K extends keyof AnalyzeRequest>(
  current: AnalyzeRequest,
  key: K,
  nextValue: AnalyzeRequest[K]
) {
  return {
    ...current,
    [key]: nextValue,
  };
}

function strategyLabel(strategy: RequestedStrategyType | null | undefined) {
  if (strategy === "call_credit_spread") return "Call Credit Spread";
  if (strategy === "put_credit_spread") return "Put Credit Spread";
  return "Credit Spread";
}

function buildDefaultSummary(value: AnalyzeRequest) {
  const mode = value.mode === "review" ? "Review mode" : "Explore mode";
  const ticker = value.ticker || "Ticker";

  if (value.mode === "review") {
    const expiration = value.expiration ?? "expiration";
    const strikes =
      value.shortStrike != null && value.longStrike != null
        ? `${value.shortStrike}/${value.longStrike}`
        : "strikes";
    return `${mode} · ${ticker} ${strategyLabel(value.strategyType)} · ${expiration} · ${strikes}`;
  }

  return `${mode} · ${ticker}`;
}

export default function AnalyzerEntryForm({
  value,
  onChange,
  onSubmit,
  isLoading,
  isCollapsed = false,
  onExpand,
  summary,
}: AnalyzerEntryFormProps) {
  const mode = (value.mode ?? "explore") as AnalyzeMode;
  const [helpOpen, setHelpOpen] = useState(false);

  if (isCollapsed) {
    return (
      <section className="rounded-[10px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 truncate text-[13px] text-slate-500">
            <span className="font-semibold text-slate-900">
              {mode === "review" ? "Review mode" : "Explore mode"}
            </span>{" "}
            · {summary ?? buildDefaultSummary(value).replace(/^Review mode · |^Explore mode · /, "")}
          </p>
          <button
            type="button"
            onClick={onExpand}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
          >
            {mode === "review" ? "Modify setup" : "Change ticker"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Find clean setups or review your own.
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Enter just a ticker to find setups that hold up. Fill in all five fields to review your exact setup.
        </p>
      </div>

      <div className="mt-5 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              mode: "explore",
              strategyType: value.strategyType ?? null,
              expiration: null,
              shortStrike: null,
              longStrike: null,
            })
          }
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            mode === "explore"
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          Find setups
        </button>
        <button
          type="button"
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            const curExp = value.expiration;
            const isStaleOrMissing = !curExp || curExp < today;
            onChange({
              ...value,
              mode: "review",
              strategyType: value.strategyType ?? "put_credit_spread",
              expiration: isStaleOrMissing ? MOCK_EXPIRATION.dateStr : curExp,
              shortStrike: value.shortStrike ?? 518,
              longStrike: value.longStrike ?? 513,
            });
          }}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            mode === "review"
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          Review your setup
        </button>
      </div>

      <p className="mt-2 text-[13px] text-slate-500">
        {mode === "explore"
          ? "Enter a ticker. We'll look for setups that hold up."
          : "Enter your exact setup and we'll run the numbers on it."}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Field label="Ticker">
          <input
            value={value.ticker}
            onChange={(event) =>
              onChange(updateField(value, "ticker", event.target.value.toUpperCase()))
            }
            placeholder="SPY"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          />
        </Field>

        {mode === "review" ? (
          <>
            <Field label="Strategy type">
              <select
                value={value.strategyType ?? "put_credit_spread"}
                onChange={(event) =>
                  onChange(
                    updateField(
                      value,
                      "strategyType",
                      event.target.value as RequestedStrategyType
                    )
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              >
                {strategyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Expiration">
              <input
                type="date"
                value={value.expiration ?? ""}
                onChange={(event) =>
                  onChange(updateField(value, "expiration", event.target.value))
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </Field>

            <Field label="Short strike">
              <input
                type="number"
                step="0.01"
                value={value.shortStrike ?? ""}
                onChange={(event) =>
                  onChange(
                    updateField(
                      value,
                      "shortStrike",
                      event.target.value === "" ? null : Number(event.target.value)
                    )
                  )
                }
                placeholder="560"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </Field>

            <Field label="Long strike">
              <input
                type="number"
                step="0.01"
                value={value.longStrike ?? ""}
                onChange={(event) =>
                  onChange(
                    updateField(
                      value,
                      "longStrike",
                      event.target.value === "" ? null : Number(event.target.value)
                    )
                  )
                }
                placeholder="555"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </Field>
          </>
        ) : (
          <div className="md:col-span-1 xl:col-span-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              Scans near-term expirations. Only surfaces setups that hold up under the review rules.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !value.ticker.trim()}
          className="inline-flex h-11 items-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
        >
          {isLoading ? "Running analysis..." : "Run analysis"}
        </button>

        {mode === "review" ? (
          <p className="text-sm leading-6 text-slate-600">
            Review mode always checks the exact strikes and expiration you enter.
          </p>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => setHelpOpen((prev) => !prev)}
          aria-expanded={helpOpen}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="text-[13px] font-medium text-slate-600">New to this?</span>
          <span className="text-[11px] font-medium text-slate-400">{helpOpen ? "Hide" : "Show"}</span>
        </button>
        {helpOpen ? (
          <div className="border-t border-slate-200 px-4 pb-4 pt-3">
            <p className="text-[13px] leading-5 text-slate-600">
              You collect a credit upfront. Your max loss is fixed — that&apos;s what makes it defined-risk.
            </p>
            <p className="mt-3 text-[13px] font-medium text-slate-700">EntryCheck helps you review:</p>
            <ul className="mt-1.5 space-y-1 text-[13px] leading-5 text-slate-600">
              <li>— how much room the trade has before hitting the short strike</li>
              <li>— how much credit you collect relative to your risk</li>
              <li>— how much you can lose if the trade goes against you</li>
              <li>— whether the setup looks reasonable before entry</li>
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
