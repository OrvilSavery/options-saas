interface CompareSetupMiniRailProps {
  currentPrice: number;
  shortStrike: number | null;
  longStrike: number | null;
  variant: "safer" | "current" | "higher_premium";
  expectedMoveLow?: number | null;
  expectedMoveHigh?: number | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPrice(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(2);
}

function getMarkerTone(variant: CompareSetupMiniRailProps["variant"]) {
  switch (variant) {
    case "current":
      return {
        rail: "bg-white/10",
        fill: "bg-white/20",
        expectedMove: "bg-sky-400/20",
        current: "bg-white border-white text-white",
        short: "bg-zinc-200 border-zinc-100 text-zinc-900",
        long: "bg-zinc-400 border-zinc-300 text-zinc-950",
        label: "text-zinc-300",
      };

    case "safer":
      return {
        rail: "bg-zinc-200",
        fill: "bg-emerald-100",
        expectedMove: "bg-sky-100",
        current: "bg-zinc-900 border-zinc-900 text-white",
        short: "bg-emerald-500 border-emerald-500 text-white",
        long: "bg-emerald-200 border-emerald-300 text-emerald-900",
        label: "text-zinc-500",
      };

    case "higher_premium":
      return {
        rail: "bg-zinc-200",
        fill: "bg-rose-100",
        expectedMove: "bg-sky-100",
        current: "bg-zinc-900 border-zinc-900 text-white",
        short: "bg-rose-500 border-rose-500 text-white",
        long: "bg-rose-200 border-rose-300 text-rose-900",
        label: "text-zinc-500",
      };
  }
}

export default function CompareSetupMiniRail({
  currentPrice,
  shortStrike,
  longStrike,
  variant,
  expectedMoveLow = null,
  expectedMoveHigh = null,
}: CompareSetupMiniRailProps) {
  if (shortStrike === null || longStrike === null) {
    return null;
  }

  const tones = getMarkerTone(variant);

  const points = [currentPrice, shortStrike, longStrike];
  if (expectedMoveLow !== null) points.push(expectedMoveLow);
  if (expectedMoveHigh !== null) points.push(expectedMoveHigh);

  const minPoint = Math.min(...points);
  const maxPoint = Math.max(...points);
  const spread = Math.max(maxPoint - minPoint, 0.01);
  const padding = spread * 0.35;

  const domainMin = minPoint - padding;
  const domainMax = maxPoint + padding;
  const domainSpan = Math.max(domainMax - domainMin, 0.01);

  const toPercent = (value: number) =>
    clamp(((value - domainMin) / domainSpan) * 100, 4, 96);

  const currentLeft = toPercent(currentPrice);
  const shortLeft = toPercent(shortStrike);
  const longLeft = toPercent(longStrike);

  const fillLeft = Math.min(shortLeft, longLeft);
  const fillRight = Math.max(shortLeft, longLeft);

  const showExpectedMove =
    expectedMoveLow !== null && expectedMoveHigh !== null && expectedMoveHigh > expectedMoveLow;

  const expectedMoveLeft = showExpectedMove ? toPercent(expectedMoveLow) : null;
  const expectedMoveRight = showExpectedMove ? toPercent(expectedMoveHigh) : null;

  return (
    <div className="rounded-2xl border border-inherit/10 bg-black/0 px-3 py-3">
      <div className="mb-3 flex items-center justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${tones.label}`}>
          Structure placement
        </p>
        {showExpectedMove ? (
          <p className={`text-[10px] font-medium uppercase tracking-wide ${tones.label}`}>
            EM range
          </p>
        ) : null}
      </div>

      <div className="relative h-12">
        <div
          className={`absolute left-0 right-0 top-5 h-1.5 rounded-full ${tones.rail}`}
        />

        {showExpectedMove && expectedMoveLeft !== null && expectedMoveRight !== null ? (
          <div
            className={`absolute top-[18px] h-5 rounded-full ${tones.expectedMove}`}
            style={{
              left: `${Math.min(expectedMoveLeft, expectedMoveRight)}%`,
              width: `${Math.max(Math.abs(expectedMoveRight - expectedMoveLeft), 2)}%`,
            }}
          />
        ) : null}

        <div
          className={`absolute top-5 h-1.5 rounded-full ${tones.fill}`}
          style={{
            left: `${fillLeft}%`,
            width: `${Math.max(fillRight - fillLeft, 2)}%`,
          }}
        />

        <Marker
          left={currentLeft}
          tone={tones.current}
          topLabel="Price"
          bottomLabel={formatPrice(currentPrice)}
        />

        <Marker
          left={shortLeft}
          tone={tones.short}
          topLabel="Short"
          bottomLabel={formatPrice(shortStrike)}
        />

        <Marker
          left={longLeft}
          tone={tones.long}
          topLabel="Long"
          bottomLabel={formatPrice(longStrike)}
        />
      </div>
    </div>
  );
}

function Marker({
  left,
  tone,
  topLabel,
  bottomLabel,
}: {
  left: number;
  tone: string;
  topLabel: string;
  bottomLabel: string;
}) {
  return (
    <div
      className="absolute top-0 -translate-x-1/2"
      style={{ left: `${left}%` }}
    >
      <div className="flex flex-col items-center">
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-current opacity-70">
          {topLabel}
        </span>
        <span className={`h-3.5 w-3.5 rounded-full border-2 shadow-sm ${tone}`} />
        <span className="mt-2 text-[11px] font-medium text-current opacity-80">
          {bottomLabel}
        </span>
      </div>
    </div>
  );
}