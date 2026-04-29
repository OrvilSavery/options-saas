import type { RawOptionsCandidate } from "@/lib/market-data/types";
import { OptionsDataUnavailableError } from "@/lib/options-data/errors";
import type {
  CallCreditSpreadGeneratedCandidate,
  CallCreditSpreadRuleset,
  RawOptionContractRow,
} from "@/lib/options-data/types";

const FIRST_CALL_CREDIT_SPREAD_RULESET: CallCreditSpreadRuleset = {
  minDte: 7,
  maxDte: 30,
  allowedWidths: [1, 2, 5],
  minPercentAboveSpot: 0.02,
  maxPercentAboveSpot: 0.12,
  minNetCredit: 0.1,
  maxGeneratedCandidates: 12,
};

function getDaysToExpiration(expiration: string): number {
  const expirationDate = new Date(`${expiration}T00:00:00Z`);
  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
}

function midpoint(bid: number | null, ask: number | null): number | null {
  if (bid == null || ask == null) return null;
  if (bid < 0 || ask < 0) return null;
  return Number(((bid + ask) / 2).toFixed(2));
}

function bidAskWidth(bid: number | null, ask: number | null): number | null {
  if (bid == null || ask == null) return null;
  if (bid < 0 || ask < 0) return null;
  if (ask < bid) return null;
  return Number((ask - bid).toFixed(2));
}

function percentAboveSpot(underlyingPrice: number, shortStrike: number): number {
  return (shortStrike - underlyingPrice) / underlyingPrice;
}

function scoreDownsideBuffer(pctAboveSpot: number): number {
  const scaled = pctAboveSpot / FIRST_CALL_CREDIT_SPREAD_RULESET.maxPercentAboveSpot;
  return Math.max(1, Math.min(10, Math.round(scaled * 10)));
}

function scorePremium(returnOnRisk: number): number {
  const scaled = Math.min(returnOnRisk / 0.35, 1);
  return Math.max(1, Math.min(10, Math.round(scaled * 10)));
}

function scoreSimplicity(width: number): number {
  if (width <= 1) return 10;
  if (width <= 2) return 9;
  if (width <= 5) return 8;
  return 6;
}

function buildSetupLabel(
  ticker: string,
  expiration: string,
  shortStrike: number,
  longStrike: number
): string {
  return `${ticker} ${expiration} ${shortStrike}/${longStrike} Call Credit Spread`;
}

function labelRoles(
  candidates: CallCreditSpreadGeneratedCandidate[]
): CallCreditSpreadGeneratedCandidate[] {
  if (candidates.length === 0) return [];

  const bySafety = [...candidates].sort((a, b) => b.shortStrike - a.shortStrike);
  const byAggression = [...candidates].sort(
    (a, b) => (b.netCredit ?? 0) - (a.netCredit ?? 0)
  );

  const saferKey = bySafety[0]?.setupLabel;
  const aggressiveKey = byAggression[0]?.setupLabel;

  const sortedByShortStrike = [...candidates].sort((a, b) => b.shortStrike - a.shortStrike);
  const balancedIndex = Math.floor(sortedByShortStrike.length / 2);
  const balancedKey = sortedByShortStrike[balancedIndex]?.setupLabel;

  return candidates.map((candidate) => {
    let role: "safer" | "balanced" | "aggressive" = "balanced";

    if (candidate.setupLabel === saferKey) {
      role = "safer";
    } else if (candidate.setupLabel === aggressiveKey) {
      role = "aggressive";
    } else if (candidate.setupLabel === balancedKey) {
      role = "balanced";
    }

    return {
      ...candidate,
      role,
    };
  });
}

function preSortCandidates(
  candidates: CallCreditSpreadGeneratedCandidate[],
  underlyingPrice: number
): CallCreditSpreadGeneratedCandidate[] {
  return [...candidates].sort((a, b) => {
    const aDistance = percentAboveSpot(underlyingPrice, a.shortStrike);
    const bDistance = percentAboveSpot(underlyingPrice, b.shortStrike);

    if (bDistance !== aDistance) {
      return bDistance - aDistance;
    }

    return (b.netCredit ?? 0) - (a.netCredit ?? 0);
  });
}

function sumNullable(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null;
  return Number(((a ?? 0) + (b ?? 0)).toFixed(2));
}

function toRatio(numerator: number | null, denominator: number | null): number | null {
  if (numerator == null || denominator == null) return null;
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return Number((numerator / denominator).toFixed(4));
}

export function generateCallCreditSpreadCandidates(
  ticker: string,
  underlyingPrice: number,
  optionRows: RawOptionContractRow[]
): RawOptionsCandidate[] {
  if (!Number.isFinite(underlyingPrice) || underlyingPrice <= 0) {
    throw new OptionsDataUnavailableError(
      `Underlying price was invalid while generating live options candidates for ${ticker}.`
    );
  }

  if (!Array.isArray(optionRows) || optionRows.length === 0) {
    throw new OptionsDataUnavailableError(
      `No normalized live option rows were available for ${ticker}.`
    );
  }

  const calls = optionRows.filter((row) => row.optionType === "call");

  if (calls.length === 0) {
    throw new OptionsDataUnavailableError(
      `No live call contracts were available for ${ticker}.`
    );
  }

  const grouped = new Map<string, RawOptionContractRow[]>();

  for (const row of calls) {
    const existing = grouped.get(row.expiration) ?? [];
    existing.push(row);
    grouped.set(row.expiration, existing);
  }

  const generated: CallCreditSpreadGeneratedCandidate[] = [];

  for (const [expiration, rows] of grouped.entries()) {
    const dte = getDaysToExpiration(expiration);

    if (
      dte < FIRST_CALL_CREDIT_SPREAD_RULESET.minDte ||
      dte > FIRST_CALL_CREDIT_SPREAD_RULESET.maxDte
    ) {
      continue;
    }

    const strikeMap = new Map<number, RawOptionContractRow>();
    for (const row of rows) {
      strikeMap.set(row.strike, row);
    }

    for (const shortRow of rows) {
      if (shortRow.strike <= underlyingPrice) {
        continue;
      }

      const pctAbove = percentAboveSpot(underlyingPrice, shortRow.strike);

      if (
        pctAbove < FIRST_CALL_CREDIT_SPREAD_RULESET.minPercentAboveSpot ||
        pctAbove > FIRST_CALL_CREDIT_SPREAD_RULESET.maxPercentAboveSpot
      ) {
        continue;
      }

      for (const width of FIRST_CALL_CREDIT_SPREAD_RULESET.allowedWidths) {
        const longStrike = Number((shortRow.strike + width).toFixed(2));
        const longRow = strikeMap.get(longStrike);

        if (!longRow) {
          continue;
        }

        const shortMid = midpoint(shortRow.bid, shortRow.ask);
        const longMid = midpoint(longRow.bid, longRow.ask);

        if (shortMid == null || longMid == null) {
          continue;
        }

        const netCredit = Number((shortMid - longMid).toFixed(2));
        if (netCredit < FIRST_CALL_CREDIT_SPREAD_RULESET.minNetCredit) {
          continue;
        }

        const maxLoss = Number((width - netCredit).toFixed(2));
        if (maxLoss <= 0) {
          continue;
        }

        const returnOnRisk = Number((netCredit / maxLoss).toFixed(2));
        if (!Number.isFinite(returnOnRisk) || returnOnRisk <= 0) {
          continue;
        }

        const shortWidth = bidAskWidth(shortRow.bid, shortRow.ask);
        const longWidth = bidAskWidth(longRow.bid, longRow.ask);
        const totalWidth = sumNullable(shortWidth, longWidth);
        const bidAskPct = toRatio(totalWidth, netCredit);
        const creditPctWidth = toRatio(netCredit, width);
        const maxLossRatio = toRatio(maxLoss, netCredit);

        generated.push({
          strategy: "Call Credit Spread",
          expiration,
          setupLabel: buildSetupLabel(ticker, expiration, shortRow.strike, longRow.strike),

          shortStrike: shortRow.strike,
          longStrike: longRow.strike,
          width,
          daysToExpiration: dte,

          premium: netCredit,
          netCredit,
          maxLoss,
          returnOnRisk,

          downsideBufferScore: scoreDownsideBuffer(pctAbove),
          premiumScore: scorePremium(returnOnRisk),
          simplicityScore: scoreSimplicity(width),

          shortLegBidAskWidth: shortWidth,
          longLegBidAskWidth: longWidth,
          shortLegVolume: shortRow.volume,
          longLegVolume: longRow.volume,
          shortLegOpenInterest: shortRow.openInterest,
          longLegOpenInterest: longRow.openInterest,

          directionalBias: "bearish",
          role: "balanced",

          strategyType: "call_credit_spread",
          shortDelta: shortRow.delta != null ? Math.abs(shortRow.delta) : null,
          creditPctWidth,
          maxLossRatio,
          bidAskPct,
          outsideExpectedMove: null,
          earningsInWindow: null,
          earningsDaysAfter: null,
          expectedMoveLow: null,
          expectedMoveHigh: null,
          ivRank: null,
          ivHvRatio: null,
        });
      }
    }
  }

  if (generated.length === 0) {
    throw new OptionsDataUnavailableError(
      `No valid live call credit spread candidates were generated for ${ticker} within the current ruleset.`
    );
  }

  const preSorted = preSortCandidates(generated, underlyingPrice).slice(
    0,
    FIRST_CALL_CREDIT_SPREAD_RULESET.maxGeneratedCandidates
  );

  return labelRoles(preSorted);
}
