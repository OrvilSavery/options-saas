import type { ComparedSetup } from "@/types/analysis";

interface PayoffDiagramCardProps {
  currentPrice: number;
  activeComparedSetup: ComparedSetup | null;
}

function formatCurrency(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `$${value.toFixed(digits)}`;
}

function formatWhole(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `$${value.toFixed(0)}`;
}

function inferStrategyKind(strategy: string | null | undefined) {
  const normalized = strategy?.toLowerCase() ?? "";
  if (normalized.includes("put") && normalized.includes("credit")) return "put";
  if (normalized.includes("call") && normalized.includes("credit")) return "call";
  return "other";
}

function deriveBreakeven(setup: ComparedSetup | null) {
  if (!setup || setup.shortStrike == null || setup.premium == null) return null;
  const kind = inferStrategyKind(setup.strategy);
  if (kind === "put") return setup.shortStrike - setup.premium;
  if (kind === "call") return setup.shortStrike + setup.premium;
  return null;
}

function clamp(value: number) {
  return Math.max(4, Math.min(96, value));
}

function buildRange(values: Array<number | null | undefined>) {
  const finite = values.filter((value): value is number => value != null && Number.isFinite(value));
  if (finite.length === 0) return { min: 0, max: 1 };
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const pad = Math.max((max - min) * 0.18, max * 0.02, 1);
  return { min: min - pad, max: max + pad };
}

function toPct(value: number | null | undefined, min: number, max: number) {
  if (value == null || !Number.isFinite(value)) return null;
  return clamp(((value - min) / Math.max(max - min, 0.0001)) * 100);
}

function roomTone(room: number | null | undefined) {
  if (room == null) return { line: "border-slate-400", pill: "border-slate-200 bg-white text-slate-600", text: "room" };
  if (room < 0.03) return { line: "border-red-500", pill: "border-red-200 bg-red-50 text-red-700", text: "tight room" };
  if (room < 0.05) return { line: "border-amber-500", pill: "border-amber-200 bg-amber-50 text-amber-700", text: "watch room" };
  return { line: "border-emerald-500", pill: "border-emerald-200 bg-emerald-50 text-emerald-700", text: "room" };
}

function Marker({ pct, tone, dashed = false, emphasize = false }: { pct: number | null; tone: "red" | "amber" | "zinc" | "black"; dashed?: boolean; emphasize?: boolean }) {
  if (pct == null) return null;
  const color = tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : tone === "black" ? "bg-slate-950" : "bg-slate-500";
  return (
    <div className={`absolute top-0 h-16 w-0.5 -translate-x-1/2 ${emphasize ? "z-20" : "z-10"} ${dashed ? "border-l-2 border-dashed border-slate-400 bg-transparent" : color}`} style={{ left: `${pct}%` }}>
      {!dashed ? <span className={`absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ${color}`} /> : null}
    </div>
  );
}

export default function PayoffDiagramCard({ currentPrice, activeComparedSetup }: PayoffDiagramCardProps) {
  if (!activeComparedSetup) return null;

  const shortStrike = activeComparedSetup.shortStrike;
  const longStrike = activeComparedSetup.longStrike;
  const breakeven = deriveBreakeven(activeComparedSetup);
  const { min, max } = buildRange([currentPrice, shortStrike, longStrike, breakeven]);
  const currentPct = toPct(currentPrice, min, max);
  const shortPct = toPct(shortStrike, min, max);
  const longPct = toPct(longStrike, min, max);
  const bePct = toPct(breakeven, min, max);
  const room = activeComparedSetup.downsideRoom;
  const tone = roomTone(room);
  const strikesAreClose = shortPct != null && longPct != null && Math.abs(shortPct - longPct) < 8;

  const connectorStart = shortPct != null && currentPct != null ? Math.min(shortPct, currentPct) : null;
  const connectorEnd = shortPct != null && currentPct != null ? Math.max(shortPct, currentPct) : null;
  const connectorGap = connectorStart != null && connectorEnd != null && connectorEnd - connectorStart > 3 ? 0.9 : 0;
  const connectorLeft = connectorStart != null ? connectorStart + connectorGap : null;
  const connectorWidth = connectorStart != null && connectorEnd != null ? Math.max(connectorEnd - connectorStart - connectorGap * 2, 0) : null;

  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-medium text-slate-800">Where price sits now</h3>
        <p className="font-mono text-xs text-slate-500">Breakeven {formatCurrency(breakeven)}</p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6">
        <div className="relative h-24">
          <div className="absolute left-0 right-0 top-[42%] z-0 h-px -translate-y-1/2 bg-slate-300" />
          {longPct != null && shortPct != null ? (
            <div className="absolute top-[42%] z-0 h-7 -translate-y-1/2 rounded-sm bg-red-500/[0.07]" style={{ left: `${Math.min(longPct, shortPct)}%`, width: `${Math.abs(shortPct - longPct)}%` }} />
          ) : null}
          {shortPct != null ? (
            <div className="absolute right-0 top-[42%] z-0 h-7 -translate-y-1/2 rounded-sm bg-gradient-to-r from-emerald-500/[0.06] to-transparent" style={{ left: `${shortPct}%` }} />
          ) : null}
          {connectorLeft != null && connectorWidth != null && connectorWidth > 0 ? (
            <div className={`absolute top-[calc(42%+20px)] z-0 h-px -translate-y-1/2 border-t border-dashed ${tone.line}`} style={{ left: `${connectorLeft}%`, width: `${connectorWidth}%` }} />
          ) : null}

          <Marker pct={longPct} tone="red" />
          <Marker pct={shortPct} tone="amber" />
          <Marker pct={bePct} tone="zinc" dashed />
          <Marker pct={currentPct} tone="black" emphasize />

          {currentPct != null ? (
            <div className="absolute -top-8 z-30 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-900 shadow-sm" style={{ left: `${currentPct}%` }}>
              {formatWhole(currentPrice)}
            </div>
          ) : null}
          {!strikesAreClose && shortPct != null ? (
            <div className="absolute -top-6 z-20 -translate-x-1/2 font-mono text-[10px] font-bold text-amber-700" style={{ left: `${shortPct}%` }}>
              {shortStrike}
            </div>
          ) : null}
          {!strikesAreClose && longPct != null ? (
            <div className="absolute top-[calc(42%+42px)] z-20 -translate-x-1/2 font-mono text-[10px] font-bold text-red-700" style={{ left: `${longPct}%` }}>
              {longStrike}
            </div>
          ) : null}
          {strikesAreClose && longPct != null && shortPct != null ? (
            <div className="absolute top-[calc(42%+42px)] z-20 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-bold shadow-sm" style={{ left: `${(longPct + shortPct) / 2}%` }}>
              <span className="inline-flex items-center gap-1 text-red-700"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{longStrike}</span>
              <span className="px-1 text-slate-300">/</span>
              <span className="inline-flex items-center gap-1 text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{shortStrike}</span>
            </div>
          ) : null}

          {shortPct != null && currentPct != null && room != null ? (
            <div className={`absolute top-[calc(42%+29px)] z-20 -translate-x-1/2 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold ${tone.pill}`} style={{ left: `${(shortPct + currentPct) / 2}%` }}>
              {(room * 100).toFixed(1)}% {tone.text}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
