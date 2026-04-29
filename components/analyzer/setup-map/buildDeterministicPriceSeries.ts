export type SetupMapTimeframe = "5D" | "1M" | "3M";

export interface SetupMapPoint {
  index: number;
  price: number;
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;

  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function getTimeframeConfig(timeframe: SetupMapTimeframe) {
  switch (timeframe) {
    case "5D":
      return {
        points: 36,
        maxMovePct: 0.035,
        driftWeight: 0.35,
      };

    case "1M":
      return {
        points: 44,
        maxMovePct: 0.06,
        driftWeight: 0.55,
      };

    case "3M":
      return {
        points: 56,
        maxMovePct: 0.11,
        driftWeight: 0.75,
      };
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Temporary deterministic preview series for localhost/demo use only.
 * This must be replaced by real underlying historical candles later.
 */
export function buildDeterministicPriceSeries(
  ticker: string,
  currentPrice: number,
  timeframe: SetupMapTimeframe
): SetupMapPoint[] {
  const { points, maxMovePct, driftWeight } = getTimeframeConfig(timeframe);
  const seed = hashString(`${ticker}::${timeframe}::${currentPrice.toFixed(2)}`);
  const random = mulberry32(seed);

  const endPrice = currentPrice;
  const startBias = (random() - 0.5) * maxMovePct * 1.2;
  let rollingPrice = endPrice * (1 + startBias);

  const raw: number[] = [];

  for (let i = 0; i < points; i += 1) {
    const progress = i / Math.max(points - 1, 1);
    const driftToCurrent =
      (endPrice - rollingPrice) * (0.035 + progress * 0.03 * driftWeight);

    const waveA = Math.sin(progress * Math.PI * (1.5 + random())) * currentPrice * 0.0065;
    const waveB = Math.cos(progress * Math.PI * (3 + random())) * currentPrice * 0.0035;
    const noise = (random() - 0.5) * currentPrice * 0.006;

    rollingPrice += driftToCurrent + waveA + waveB + noise;

    const minAllowed = currentPrice * (1 - maxMovePct);
    const maxAllowed = currentPrice * (1 + maxMovePct);

    rollingPrice = clamp(rollingPrice, minAllowed, maxAllowed);
    raw.push(rollingPrice);
  }

  raw[raw.length - 1] = endPrice;

  const smoothed = raw.map((value, index) => {
    if (index === 0 || index === raw.length - 1) return value;

    const prev = raw[index - 1];
    const next = raw[index + 1];

    return (prev * 0.2 + value * 0.6 + next * 0.2);
  });

  smoothed[smoothed.length - 1] = endPrice;

  return smoothed.map((price, index) => ({
    index,
    price: Number(price.toFixed(2)),
  }));
}