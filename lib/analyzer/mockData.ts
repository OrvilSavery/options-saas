import type { Decision, EventRisk } from "@/types/analysis";

export interface MockStrategyCandidate {
  strategy: string;
  expiration: string;
  setupLabel: string;
  premium: number | null;
  returnOnRisk: number | null;
  downsideBufferScore: number;
  premiumScore: number;
  simplicityScore: number;
  role: "safer" | "balanced" | "aggressive";
}

export interface MockTickerProfile {
  ticker: string;
  price: number;
  marketCondition: string;
  volatilityCondition: string;
  eventRisk: EventRisk;
  decision: Decision;
  risks: string[];
  candidateStrategies: MockStrategyCandidate[];
}

// Compute a Friday ~35 DTE from today, deterministically at module load time.
const EXP = (() => {
  const today = new Date();
  const target = new Date(today);
  target.setDate(today.getDate() + 35);
  const dow = target.getDay(); // 0=Sun … 6=Sat
  const toFri = dow <= 5 ? 5 - dow : 6;
  target.setDate(target.getDate() + toFri);
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  const dateStr = `${target.getFullYear()}-${mm}-${dd}`;
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const label = `${monthNames[target.getMonth()]} ${target.getDate()}`;
  return { dateStr, label };
})();

// Shared export so fixtures and preview components stay in sync with mock chain dates.
export const MOCK_EXPIRATION = EXP;

const D = EXP.dateStr;
const L = EXP.label;

const SPY_PROFILE: MockTickerProfile = {
  ticker: "SPY",
  price: 542.31,
  marketCondition:
    "Neutral to slightly bullish with recent consolidation above support and no obvious breakdown underway.",
  volatilityCondition:
    "Premium is workable but not unusually rich, so the setup needs to win more through structure than through oversized credit.",
  eventRisk: "low",
  decision: "valid",
  risks: [
    "A broad market selloff could test the short strike faster than the premium suggests.",
    "Because premium is only moderate, the setup does not have a large forgiveness cushion.",
    "A volatility expansion could pressure the spread before expiration even if price is still above the short strike.",
  ],
  candidateStrategies: [
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `SPY ${L} 510/505 Put Credit Spread`,
      premium: 1.05,
      returnOnRisk: 0.26,
      downsideBufferScore: 9,
      premiumScore: 6,
      simplicityScore: 9,
      role: "safer",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `SPY ${L} 518/513 Put Credit Spread`,
      premium: 1.42,
      returnOnRisk: 0.39,
      downsideBufferScore: 7,
      premiumScore: 8,
      simplicityScore: 9,
      role: "balanced",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `SPY ${L} 524/519 Put Credit Spread`,
      premium: 1.88,
      returnOnRisk: 0.6,
      downsideBufferScore: 5,
      premiumScore: 9,
      simplicityScore: 9,
      role: "aggressive",
    },
  ],
};

const QQQ_PROFILE: MockTickerProfile = {
  ticker: "QQQ",
  price: 468.42,
  marketCondition:
    "Uptrend remains intact, but price is carrying more short-term stretch than SPY and may not offer the same clean cushion on closer downside strikes.",
  volatilityCondition:
    "Premium is decent for defined-risk selling, though still not high enough to justify getting careless with strike proximity.",
  eventRisk: "medium",
  decision: "watchlist",
  risks: [
    "Tech-led momentum can reverse sharply, which makes closer short puts less forgiving.",
    "The setup can look attractive on premium alone while still being too close to a short-term pullback zone.",
    "If leadership weakens, the watchlist posture can change quickly from workable to pass.",
  ],
  candidateStrategies: [
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `QQQ ${L} 440/435 Put Credit Spread`,
      premium: 1.12,
      returnOnRisk: 0.29,
      downsideBufferScore: 8,
      premiumScore: 6,
      simplicityScore: 9,
      role: "safer",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `QQQ ${L} 448/443 Put Credit Spread`,
      premium: 1.55,
      returnOnRisk: 0.45,
      downsideBufferScore: 6,
      premiumScore: 8,
      simplicityScore: 9,
      role: "balanced",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `QQQ ${L} 454/449 Put Credit Spread`,
      premium: 1.98,
      returnOnRisk: 0.65,
      downsideBufferScore: 4,
      premiumScore: 9,
      simplicityScore: 9,
      role: "aggressive",
    },
  ],
};

const IWM_PROFILE: MockTickerProfile = {
  ticker: "IWM",
  price: 212.76,
  marketCondition:
    "Range-bound and less directionally clean, which makes a neutral premium structure more sensible than leaning too hard on a bullish assumption.",
  volatilityCondition:
    "Premium is fair for neutral defined-risk selling and supports a balanced condor better than forcing a directional spread.",
  eventRisk: "medium",
  decision: "valid",
  risks: [
    "A range break in either direction could challenge a neutral structure quickly.",
    "Smaller-cap indices can move unevenly, which makes strike placement more important than raw credit.",
    "If volatility contracts too much, the edge from neutral premium selling becomes less compelling.",
  ],
  candidateStrategies: [
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `IWM ${L} 196/191 Put Credit Spread`,
      premium: 0.98,
      returnOnRisk: 0.24,
      downsideBufferScore: 8,
      premiumScore: 5,
      simplicityScore: 9,
      role: "safer",
    },
    {
      strategy: "Iron Condor",
      expiration: D,
      setupLabel: `IWM ${L} 198/193/228/233 Iron Condor`,
      premium: 2.1,
      returnOnRisk: 0.72,
      downsideBufferScore: 7,
      premiumScore: 9,
      simplicityScore: 5,
      role: "balanced",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `IWM ${L} 202/197 Put Credit Spread`,
      premium: 1.35,
      returnOnRisk: 0.37,
      downsideBufferScore: 5,
      premiumScore: 7,
      simplicityScore: 9,
      role: "aggressive",
    },
  ],
};

const AAPL_PROFILE: MockTickerProfile = {
  ticker: "AAPL",
  price: 198.14,
  marketCondition:
    "Trend is constructive, but the name is still capable of sharp single-stock reactions that justify a more selective entry than the index ETFs.",
  volatilityCondition:
    "Premium is acceptable for defined-risk selling, though not rich enough to ignore single-name gap risk.",
  eventRisk: "medium",
  decision: "watchlist",
  risks: [
    "Single-stock event reactions are harder to absorb than broad ETF moves.",
    "The setup may still be usable, but the bar should be higher than for index-based premium selling.",
    "A cleaner entry may come from waiting for either better premium or more downside room.",
  ],
  candidateStrategies: [
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `AAPL ${L} 180/175 Put Credit Spread`,
      premium: 1.0,
      returnOnRisk: 0.25,
      downsideBufferScore: 8,
      premiumScore: 5,
      simplicityScore: 9,
      role: "safer",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `AAPL ${L} 185/180 Put Credit Spread`,
      premium: 1.38,
      returnOnRisk: 0.38,
      downsideBufferScore: 6,
      premiumScore: 7,
      simplicityScore: 9,
      role: "balanced",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `AAPL ${L} 188/183 Put Credit Spread`,
      premium: 1.72,
      returnOnRisk: 0.52,
      downsideBufferScore: 4,
      premiumScore: 9,
      simplicityScore: 9,
      role: "aggressive",
    },
  ],
};

const NVDA_PROFILE: MockTickerProfile = {
  ticker: "NVDA",
  price: 118.27,
  marketCondition:
    "Momentum remains strong, but the stock still carries enough headline and positioning risk that closer premium-selling strikes can turn from comfortable to crowded very quickly.",
  volatilityCondition:
    "Premium is richer than the broad index names, but that premium is being paid for real movement risk.",
  eventRisk: "high",
  decision: "pass",
  risks: [
    "High-interest names can reprice quickly and gap through nearby short strikes.",
    "Richer premium can create a false sense of safety if the underlying is still moving too fast.",
    "This is the kind of setup where passing is cleaner than forcing a credit just because the numbers look bigger.",
  ],
  candidateStrategies: [
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `NVDA ${L} 98/93 Put Credit Spread`,
      premium: 1.15,
      returnOnRisk: 0.3,
      downsideBufferScore: 7,
      premiumScore: 6,
      simplicityScore: 9,
      role: "safer",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `NVDA ${L} 103/98 Put Credit Spread`,
      premium: 1.62,
      returnOnRisk: 0.48,
      downsideBufferScore: 5,
      premiumScore: 8,
      simplicityScore: 9,
      role: "balanced",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `NVDA ${L} 107/102 Put Credit Spread`,
      premium: 2.05,
      returnOnRisk: 0.69,
      downsideBufferScore: 3,
      premiumScore: 9,
      simplicityScore: 9,
      role: "aggressive",
    },
  ],
};

const XLF_PROFILE: MockTickerProfile = {
  ticker: "XLF",
  price: 45.62,
  marketCondition:
    "Trend is stable and less explosive than the higher-beta growth names, which supports a cleaner premium-selling posture if the strikes stay conservative.",
  volatilityCondition:
    "Premium is modest, so the setup works better as a simple defined-risk spread than as an overengineered structure.",
  eventRisk: "low",
  decision: "valid",
  risks: [
    "Because premium is modest, moving too far from the safer strike quickly weakens the quality of the setup.",
    "Sector ETFs can still react to macro shifts even when day-to-day action looks calm.",
    "A slower-moving product can invite over-aggression if the trader chases more credit than the setup supports.",
  ],
  candidateStrategies: [
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `XLF ${L} 42/41 Put Credit Spread`,
      premium: 0.26,
      returnOnRisk: 0.35,
      downsideBufferScore: 9,
      premiumScore: 4,
      simplicityScore: 9,
      role: "safer",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `XLF ${L} 43/42 Put Credit Spread`,
      premium: 0.38,
      returnOnRisk: 0.61,
      downsideBufferScore: 7,
      premiumScore: 7,
      simplicityScore: 9,
      role: "balanced",
    },
    {
      strategy: "Put Credit Spread",
      expiration: D,
      setupLabel: `XLF ${L} 44/43 Put Credit Spread`,
      premium: 0.54,
      returnOnRisk: 1.17,
      downsideBufferScore: 4,
      premiumScore: 9,
      simplicityScore: 9,
      role: "aggressive",
    },
  ],
};

const DIA_PROFILE: MockTickerProfile = {
  ticker: "DIA",
  price: 401.28,
  marketCondition:
    "Trend is steady, but the index is near recent highs, so bearish premium-selling needs cleaner room than the richer-looking strikes suggest.",
  volatilityCondition:
    "Premium is workable for a defined-risk call spread, but not rich enough to justify selling too close to current price.",
  eventRisk: "low",
  decision: "watchlist",
  risks: [
    "If the rally continues, tighter call strikes can get crowded quickly.",
    "The setup works better when the short strike leaves clear room above current price rather than relying on a stall right away.",
    "A calmer tape can make the credit look safe even when the strike placement is still too tight.",
  ],
  candidateStrategies: [
    {
      strategy: "Call Credit Spread",
      expiration: D,
      setupLabel: `DIA ${L} 416/421 Call Credit Spread`,
      premium: 0.92,
      returnOnRisk: 0.22,
      downsideBufferScore: 8,
      premiumScore: 5,
      simplicityScore: 9,
      role: "safer",
    },
    {
      strategy: "Call Credit Spread",
      expiration: D,
      setupLabel: `DIA ${L} 411/416 Call Credit Spread`,
      premium: 1.28,
      returnOnRisk: 0.34,
      downsideBufferScore: 6,
      premiumScore: 7,
      simplicityScore: 9,
      role: "balanced",
    },
    {
      strategy: "Call Credit Spread",
      expiration: D,
      setupLabel: `DIA ${L} 407/412 Call Credit Spread`,
      premium: 1.62,
      returnOnRisk: 0.48,
      downsideBufferScore: 4,
      premiumScore: 9,
      simplicityScore: 9,
      role: "aggressive",
    },
  ],
};

// Deterministic variant: 0=strong/valid, 1=mixed/watchlist, 2=weak/pass
function buildGenericProfile(ticker: string): MockTickerProfile {
  const code =
    ticker.charCodeAt(0) +
    (ticker.length > 1 ? ticker.charCodeAt(ticker.length - 1) : 0);
  const variant = code % 3;

  const strong = variant === 0;
  const weak = variant === 2;

  const decision: Decision = strong ? "valid" : weak ? "pass" : "watchlist";
  const eventRisk: EventRisk = strong ? "low" : weak ? "high" : "medium";

  const marketCondition = strong
    ? "Trend is constructive and premium is clean, supporting a disciplined defined-risk entry at current levels."
    : weak
    ? "Elevated risk and compressed structure make forced entries here lower quality than the numbers suggest."
    : "Neutral and mixed, without enough structure to treat the setup as especially clean from the start.";

  const volatilityCondition = strong
    ? "Premium is solid and the strikes offer enough room to be selective without leaving too much on the table."
    : weak
    ? "Premium looks rich but reflects real movement risk, not opportunity — the credit does not justify the exposure."
    : "Premium is serviceable but not rich enough to excuse weak structure or crowded strikes.";

  const risks = strong
    ? [
        "Even clean setups can be caught by sudden macro events that override the technical setup.",
        "A strong entry does not mean an infallible one — position sizing still matters.",
        "Complacency in a clean setup can lead to ignoring deteriorating conditions too slowly.",
      ]
    : weak
    ? [
        "The risk profile here is unfavorable enough that passing is the higher-quality action.",
        "Forcing a credit in a high-risk name often costs more than the premium received.",
        "A better opportunity in a calmer name is almost always preferable to this kind of forced entry.",
      ]
    : [
        "The setup is not weak enough to dismiss outright, but not clean enough to force either.",
        "A better entry may come from either more premium or more distance from the short strike.",
        "Without a stronger edge, execution discipline matters more than chasing the first available credit.",
      ];

  return {
    ticker,
    price: 185.5,
    marketCondition,
    volatilityCondition,
    eventRisk,
    decision,
    risks,
    candidateStrategies: [
      {
        strategy: "Put Credit Spread",
        expiration: D,
        setupLabel: `${ticker} ${L} 170/165 Put Credit Spread`,
        premium: strong ? 1.1 : weak ? 0.62 : 0.78,
        returnOnRisk: strong ? 0.28 : weak ? 0.14 : 0.18,
        downsideBufferScore: strong ? 9 : weak ? 6 : 8,
        premiumScore: strong ? 7 : weak ? 3 : 4,
        simplicityScore: 9,
        role: "safer",
      },
      {
        strategy: "Iron Condor",
        expiration: D,
        setupLabel: `${ticker} ${L} 175/170/195/200 Iron Condor`,
        premium: strong ? 2.2 : weak ? 1.1 : 1.85,
        returnOnRisk: strong ? 0.78 : weak ? 0.38 : 0.59,
        downsideBufferScore: strong ? 7 : weak ? 4 : 6,
        premiumScore: strong ? 9 : weak ? 5 : 7,
        simplicityScore: 5,
        role: "balanced",
      },
      {
        strategy: "Put Credit Spread",
        expiration: D,
        setupLabel: `${ticker} ${L} 180/175 Put Credit Spread`,
        premium: strong ? 1.55 : weak ? 0.88 : 1.12,
        returnOnRisk: strong ? 0.45 : weak ? 0.21 : 0.29,
        downsideBufferScore: strong ? 6 : weak ? 3 : 5,
        premiumScore: strong ? 9 : weak ? 6 : 7,
        simplicityScore: 9,
        role: "aggressive",
      },
    ],
  };
}

export function getMockTickerProfile(ticker: string): MockTickerProfile {
  const normalizedTicker = ticker.trim().toUpperCase();

  switch (normalizedTicker) {
    case "SPY":
      return SPY_PROFILE;
    case "QQQ":
      return QQQ_PROFILE;
    case "IWM":
      return IWM_PROFILE;
    case "AAPL":
      return AAPL_PROFILE;
    case "NVDA":
      return NVDA_PROFILE;
    case "XLF":
      return XLF_PROFILE;
    case "DIA":
      return DIA_PROFILE;
    default:
      return buildGenericProfile(normalizedTicker);
  }
}
