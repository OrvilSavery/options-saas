"use client";

import { useMemo, useRef, useState } from "react";
import type { ComparedSetup } from "@/types/analysis";
import {
  buildDeterministicPriceSeries,
  type SetupMapPoint,
  type SetupMapTimeframe,
} from "@/components/analyzer/setup-map/buildDeterministicPriceSeries";

interface SetupMapCardProps {
  ticker: string;
  currentPrice: number;
  activeComparedSetup: ComparedSetup | null;
}

const SVG_WIDTH = 980;
const SVG_HEIGHT = 430;
const MARGIN = {
  top: 24,
  right: 76,
  bottom: 30,
  left: 18,
};

const TIMEFRAMES: SetupMapTimeframe[] = ["5D", "1M", "3M"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value: number | null | undefined, digits = 2) {
  if (value == null) return "—";
  return `$${value.toFixed(digits)}`;
}

function inferOrientation(strategy: string | null) {
  const value = strategy?.toLowerCase() ?? "";
  if (value.includes("put")) return "bullish";
  if (value.includes("call")) return "bearish";
  return "neutral";
}

function buildChartPath(
  points: SetupMapPoint[],
  xForIndex: (index: number) => number,
  yForPrice: (price: number) => number
) {
  return points
    .map((point, index) => {
      const prefix = index === 0 ? "M" : "L";
      return `${prefix} ${xForIndex(point.index)} ${yForPrice(point.price)}`;
    })
    .join(" ");
}

function buildAreaPath(
  points: SetupMapPoint[],
  xForIndex: (index: number) => number,
  yForPrice: (price: number) => number,
  floorY: number
) {
  if (points.length === 0) return "";
  const line = buildChartPath(points, xForIndex, yForPrice);
  const last = points[points.length - 1];
  const first = points[0];
  return [
    line,
    `L ${xForIndex(last.index)} ${floorY}`,
    `L ${xForIndex(first.index)} ${floorY}`,
    "Z",
  ].join(" ");
}

function yTicks(min: number, max: number) {
  const steps = 5;
  const range = max - min;
  const tickStep = range / steps;
  return Array.from({ length: steps + 1 }, (_, index) =>
    Number((min + tickStep * index).toFixed(2))
  );
}

function timeframeLabel(timeframe: SetupMapTimeframe, index: number, total: number) {
  const progress = index / Math.max(total - 1, 1);
  if (progress >= 0.98) return "Now";
  switch (timeframe) {
    case "5D":
      return `${Math.max(1, Math.round((1 - progress) * 5))}D ago`;
    case "1M":
      return `${Math.max(1, Math.round((1 - progress) * 4))}W ago`;
    case "3M":
      return `${Math.max(1, Math.round((1 - progress) * 3))}M ago`;
  }
}

function strategyTone(role: ComparedSetup["role"] | null) {
  switch (role) {
    case "safer":
      return {
        line: "#059669",
        lineSoft: "#86efac",
        zoneSafe: "rgba(16, 185, 129, 0.12)",
        zoneCaution: "rgba(245, 158, 11, 0.10)",
        zoneRisk: "rgba(239, 68, 68, 0.10)",
        strike: "#059669",
        strikeSoft: "#6ee7b7",
        current: "#111827",
      };
    case "higher_premium":
      return {
        line: "#e11d48",
        lineSoft: "#fda4af",
        zoneSafe: "rgba(16, 185, 129, 0.10)",
        zoneCaution: "rgba(245, 158, 11, 0.10)",
        zoneRisk: "rgba(225, 29, 72, 0.12)",
        strike: "#e11d48",
        strikeSoft: "#fda4af",
        current: "#111827",
      };
    case "current":
    default:
      return {
        line: "#2563eb",
        lineSoft: "#93c5fd",
        zoneSafe: "rgba(16, 185, 129, 0.11)",
        zoneCaution: "rgba(245, 158, 11, 0.10)",
        zoneRisk: "rgba(239, 68, 68, 0.11)",
        strike: "#2563eb",
        strikeSoft: "#93c5fd",
        current: "#111827",
      };
  }
}

export default function SetupMapCard({
  ticker,
  currentPrice,
  activeComparedSetup,
}: SetupMapCardProps) {
  const [timeframe, setTimeframe] = useState<SetupMapTimeframe>("1M");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const points = useMemo(
    () => buildDeterministicPriceSeries(ticker, currentPrice, timeframe),
    [ticker, currentPrice, timeframe]
  );

  if (!activeComparedSetup) return null;

  const chartWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const chartHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  const shortStrike = activeComparedSetup.shortStrike;
  const longStrike = activeComparedSetup.longStrike;
  const orientation = inferOrientation(activeComparedSetup.strategy);
  const tones = strategyTone(activeComparedSetup.role);

  const domainCandidates = points.map((point) => point.price);
  if (shortStrike != null) domainCandidates.push(shortStrike);
  if (longStrike != null) domainCandidates.push(longStrike);
  domainCandidates.push(currentPrice);

  const minCandidate = Math.min(...domainCandidates);
  const maxCandidate = Math.max(...domainCandidates);
  const padding = Math.max((maxCandidate - minCandidate) * 0.18, currentPrice * 0.02);

  const domainMin = minCandidate - padding;
  const domainMax = maxCandidate + padding;
  const domainRange = Math.max(domainMax - domainMin, 0.01);

  const xForIndex = (index: number) =>
    MARGIN.left + (index / Math.max(points.length - 1, 1)) * chartWidth;

  const yForPrice = (price: number) =>
    MARGIN.top + ((domainMax - price) / domainRange) * chartHeight;

  const path = buildChartPath(points, xForIndex, yForPrice);
  const areaPath = buildAreaPath(points, xForIndex, yForPrice, MARGIN.top + chartHeight);

  const lastPoint = points[points.length - 1];
  const currentX = xForIndex(lastPoint.index);
  const currentY = yForPrice(lastPoint.price);

  const hoveredPoint =
    hoveredIndex != null ? points[clamp(hoveredIndex, 0, points.length - 1)] : null;
  const hoverX = hoveredPoint ? xForIndex(hoveredPoint.index) : null;
  const hoverY = hoveredPoint ? yForPrice(hoveredPoint.price) : null;

  const shortY = shortStrike != null ? yForPrice(shortStrike) : null;
  const longY = longStrike != null ? yForPrice(longStrike) : null;

  const topY = MARGIN.top;
  const bottomY = MARGIN.top + chartHeight;
  const leftX = MARGIN.left;
  const rightX = MARGIN.left + chartWidth;

  const ticks = yTicks(domainMin, domainMax);
  const showZones = shortY != null && longY != null;

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const localX = ((event.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const clampedX = clamp(localX, leftX, rightX);
    const progress = (clampedX - leftX) / chartWidth;
    const nextIndex = Math.round(progress * Math.max(points.length - 1, 1));
    setHoveredIndex(nextIndex);
  }

  return (
    <div>
      {/* Header: label + timeframe selector */}
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Price vs. strikes
        </span>
        <div className="flex gap-1.5">
          {TIMEFRAMES.map((value) => {
            const isActive = value === timeframe;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTimeframe(value)}
                className={[
                  "rounded-lg border px-2.5 py-1 text-xs font-medium transition",
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="px-1 pb-1 sm:px-2 sm:pb-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="block h-[300px] w-full cursor-crosshair sm:h-[360px]"
          role="img"
          aria-label={`${ticker} price path chart`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="setup-map-area-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={tones.lineSoft} stopOpacity="0.22" />
              <stop offset="100%" stopColor={tones.lineSoft} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect x={leftX} y={topY} width={chartWidth} height={chartHeight} rx="18" fill="#fafafa" />

          {ticks.map((tick) => {
            const y = yForPrice(tick);
            return (
              <g key={tick}>
                <line x1={leftX} x2={rightX} y1={y} y2={y} stroke="#e4e4e7" strokeDasharray="4 6" />
                <text x={rightX + 10} y={y + 4} fontSize="11" fill="#71717a" className="hidden sm:inline">
                  {tick.toFixed(2)}
                </text>
              </g>
            );
          })}

          {showZones && orientation !== "neutral" ? (
            <>
              {orientation === "bullish" ? (
                <>
                  <rect x={leftX} y={topY} width={chartWidth} height={Math.max((shortY ?? topY) - topY, 0)} fill={tones.zoneSafe} />
                  <rect x={leftX} y={shortY ?? topY} width={chartWidth} height={Math.max((longY ?? topY) - (shortY ?? topY), 0)} fill={tones.zoneCaution} />
                  <rect x={leftX} y={longY ?? topY} width={chartWidth} height={Math.max(bottomY - (longY ?? bottomY), 0)} fill={tones.zoneRisk} />
                </>
              ) : (
                <>
                  <rect x={leftX} y={topY} width={chartWidth} height={Math.max((longY ?? topY) - topY, 0)} fill={tones.zoneRisk} />
                  <rect x={leftX} y={longY ?? topY} width={chartWidth} height={Math.max((shortY ?? topY) - (longY ?? topY), 0)} fill={tones.zoneCaution} />
                  <rect x={leftX} y={shortY ?? bottomY} width={chartWidth} height={Math.max(bottomY - (shortY ?? bottomY), 0)} fill={tones.zoneSafe} />
                </>
              )}
            </>
          ) : null}

          {shortY != null ? (
            <>
              <line x1={leftX} x2={rightX} y1={shortY} y2={shortY} stroke={tones.strike} strokeWidth="1.5" strokeDasharray="8 6" />
              <text x={leftX + 12} y={shortY - 8} fontSize="11" fontWeight="600" fill={tones.strike} className="hidden sm:inline">
                Short strike · {formatCurrency(shortStrike)}
              </text>
            </>
          ) : null}

          {longY != null ? (
            <>
              <line x1={leftX} x2={rightX} y1={longY} y2={longY} stroke={tones.strikeSoft} strokeWidth="1.5" strokeDasharray="8 6" />
              <text x={leftX + 12} y={longY - 8} fontSize="11" fontWeight="600" fill={tones.strikeSoft} className="hidden sm:inline">
                Long strike · {formatCurrency(longStrike)}
              </text>
            </>
          ) : null}

          <line x1={leftX} x2={rightX} y1={currentY} y2={currentY} stroke={tones.current} strokeDasharray="3 5" opacity="0.2" />

          <path d={areaPath} fill="url(#setup-map-area-gradient)" />
          <path d={path} fill="none" stroke={tones.line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={currentX} cy={currentY} r="6.5" fill="#ffffff" stroke={tones.line} strokeWidth="3" />

          {hoveredPoint && hoverX != null && hoverY != null ? (
            <>
              <line x1={hoverX} x2={hoverX} y1={topY} y2={bottomY} stroke={tones.line} strokeDasharray="4 6" opacity="0.4" />
              <circle cx={hoverX} cy={hoverY} r="5.5" fill="#ffffff" stroke={tones.line} strokeWidth="3" />
              <foreignObject
                x={Math.min(hoverX + 10, rightX - 170)}
                y={Math.max(hoverY - 56, topY + 8)}
                width="160"
                height="56"
              >
                <div className="rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    {timeframeLabel(timeframe, hoveredPoint.index, points.length)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{formatCurrency(hoveredPoint.price)}</p>
                </div>
              </foreignObject>
            </>
          ) : (
            <foreignObject
              x={Math.min(currentX + 10, rightX - 160)}
              y={Math.max(currentY - 54, topY + 8)}
              width="150"
              height="48"
            >
              <div className="rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Current price</p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">{formatCurrency(currentPrice)}</p>
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-3 py-2 sm:px-4">
        <LegendSwatch color="bg-emerald-100" label="Favorable" />
        <LegendSwatch color="bg-amber-100" label="Between strikes" />
        <LegendSwatch color="bg-rose-100" label="Risk zone" />
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
    </div>
  );
}
