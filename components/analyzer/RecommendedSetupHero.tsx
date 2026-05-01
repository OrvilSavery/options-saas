import type { AnalysisMetadata, BestStrategy, ComparedSetup, Decision, EventRisk } from "@/types/analysis";
import { buildHumanInterpretation } from "@/lib/analyzer/formatters/buildHeroInterpretation";

interface RecommendedSetupHeroProps {
  ticker: string;
  price: number;
  decision: Decision;
  eventRisk: EventRisk;
  bestStrategy: BestStrategy | null;
  activeComparedSetup: ComparedSetup | null;
  leadSetup: ComparedSetup | null;
  analysisMode: "explore" | "review";
  risks: string[];
  explanation: string;
  metadata?: AnalysisMetadata;
}

function decisionTone(decision: Decision) {
  switch (decision) {
    case "valid":
      return {
        topBorder: "border-t-emerald-500",
        text: "text-emerald-700",
        pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
        wash: "bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_42%)]",
      };
    case "watchlist":
      return {
        topBorder: "border-t-amber-400",
        text: "text-amber-700",
        pill: "border-amber-200 bg-amber-50 text-amber-700",
        wash: "bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.09),transparent_42%)]",
      };
    case "pass":
      return {
        topBorder: "border-t-red-500",
        text: "text-red-700",
        pill: "border-red-200 bg-red-50 text-red-700",
        wash: "bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.08),transparent_42%)]",
      };
  }
}

function postureLabel(decision: Decision) {
  if (decision === "valid") return "Valid setup";
  if (decision === "watchlist") return "Watchlist";
  return "Pass";
}

function warmHeadline(decision: Decision) {
  if (decision === "valid") return "This looks workable.";
  if (decision === "watchlist") return "Close, but something feels tight.";
  return "This one doesn’t line up well.";
}


function formatCurrency(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `$${value.toFixed(digits)}`;
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatPercentValue(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  return `${(value * 100).toFixed(1)}%`;
}

function buildExplanation({
  decision,
  setup,
  price,
  explanation,
}: {
  decision: Decision;
  setup: ComparedSetup | null;
  price: number;
  explanation: string;
}) {
  if (decision === "pass" && setup) {
    const rawRoom = setup.downsideRoom;
    const room = formatPercentValue(rawRoom);
    const dte = setup.daysToExpiration != null ? `${Math.round(setup.daysToExpiration)} days` : null;
    if (room && dte) {
      if (rawRoom != null && rawRoom >= 0.08) {
        return (
          <>
            Short strike is <NumberText>{room}</NumberText> from current price with <NumberText>{dte}</NumberText> left. Room is not the main issue here.
          </>
        );
      }
      return (
        <>
          Short strike is <NumberText>{room}</NumberText> from current price with <NumberText>{dte}</NumberText> left. Not much room if things move against you.
        </>
      );
    }
  }

  if (decision === "watchlist" && setup) {
    const rawRoom = setup.downsideRoom;
    const room = formatPercentValue(rawRoom);
    const dte = setup.daysToExpiration != null ? `${Math.round(setup.daysToExpiration)} days` : null;
    if (room && dte) {
      if (rawRoom != null && rawRoom >= 0.08) {
        return (
          <>
            <NumberText>{room}</NumberText> of room with <NumberText>{dte}</NumberText> left. Room is not the main concern here.
          </>
        );
      }
      return (
        <>
          <NumberText>{room}</NumberText> of room and <NumberText>{dte}</NumberText> — that&apos;s what&apos;s keeping it from looking clean.
        </>
      );
    }
    return <>One or more things aren&apos;t clearing the review rules.</>;
  }

  if (decision === "valid" && setup) {
    const room = formatPercentValue(setup.downsideRoom);
    const dte = setup.daysToExpiration != null ? `${Math.round(setup.daysToExpiration)} days` : null;
    if (room && dte) {
      return (
        <>
          <NumberText>{room}</NumberText> to the short strike, <NumberText>{dte}</NumberText> left. Looks workable.
        </>
      );
    }
    if (room) {
      return <><NumberText>{room}</NumberText> to the short strike, capped max loss.</>;
    }
  }

  return explanation ? <>{explanation}</> : <>Look at the risk flags and alternatives for the full picture.</>;

}

function NumberText({ children }: { children: React.ReactNode }) {
  return <span className="font-mono font-semibold text-slate-900">{children}</span>;
}

export default function RecommendedSetupHero({
  ticker,
  price,
  decision,
  activeComparedSetup,
  analysisMode,
  risks,
  explanation,
  metadata,
}: RecommendedSetupHeroProps) {
  const tone = decisionTone(decision);
  const analyzedAt = formatTimestamp(metadata?.analyzedAt);
  const noCleanSetup = analysisMode === "explore" && !activeComparedSetup;
  const contextLine = [metadata?.marketSessionLabel, metadata?.quoteStatusLabel, metadata?.dataSourceLabel].filter(Boolean).join(" · ");

  if (noCleanSetup) {
    return (
      <section className="overflow-hidden rounded-b-xl border border-t-[5px] border-slate-200 border-t-slate-400 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              No clean setup found
            </span>
            {analyzedAt ? (
              <div className="text-right">
                <p className="font-mono text-[11px] text-slate-400">Analyzed {analyzedAt}</p>
                {contextLine ? <p className="mt-1 text-[11px] text-slate-400">{contextLine}</p> : null}
              </div>
            ) : null}
          </div>
          <h2 className="mt-5 font-mono text-[32px] font-bold leading-tight tracking-tight text-slate-950">
            Pass
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-slate-600">
            Nothing checked cleared the current review rules.
          </p>
          {metadata?.exploreContext ? (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Screened {metadata.exploreContext.screenedExpirationCount ?? "near-term"} expiration{metadata.exploreContext.screenedExpirationCount === 1 ? "" : "s"} in the {metadata.exploreContext.preferredDteMin}–{metadata.exploreContext.preferredDteMax} DTE window.
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (!activeComparedSetup) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-950">No active setup selected</h3>
        <p className="mt-2 text-sm text-slate-600">Choose a setup to continue the review.</p>
      </section>
    );
  }

  const modeLabel = analysisMode === "review" ? "Your setup" : "Setup found";

  return (
    <section className={`overflow-hidden rounded-b-xl border border-t-[5px] border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] ${tone.topBorder} ${tone.wash}`}>
      <div className="p-6 md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${tone.pill}`}>
              {postureLabel(decision)}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {modeLabel}
            </span>
          </div>
          {analyzedAt ? (
              <div className="text-right">
                <p className="font-mono text-[11px] text-slate-400">Analyzed {analyzedAt}</p>
                {contextLine ? <p className="mt-1 text-[11px] text-slate-400">{contextLine}</p> : null}
              </div>
            ) : null}
        </div>

        <h2 className={`mt-5 font-mono text-[32px] font-bold leading-none tracking-tight ${tone.text}`}>
          {postureLabel(decision)}
        </h2>

        <p className="mt-3 text-[15px] leading-6 text-slate-700">
          {warmHeadline(decision)}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {buildHumanInterpretation(decision, activeComparedSetup, risks)}
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          {buildExplanation({ decision, setup: activeComparedSetup, price, explanation })}
        </p>
      </div>
    </section>
  );
}
