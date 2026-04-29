// ============================================================
// CREDIT SPREAD SCORING ENGINE v2.1
//
// Deterministic production scoring logic. It powers posture, risk flags,
// and alternative generation behind the analyzer. User-facing UI should not
// expose raw score/category internals.
// ============================================================

export interface CreditSpreadEngineParams {
  ivRank: number;
  ivHvRatio: number;
  dte: number;
  shortDelta: number;
  creditPctWidth: number;
  maxLossRatio: number;
  outsideEM: boolean;
  earningsInWindow: boolean;
  earningsDaysAfter: number | null;
  bidAskPct: number;
}

export type CreditSpreadEngineVerdictBand =
  | "high_conviction"
  | "good_setup"
  | "watchlist"
  | "weak"
  | "pass"
  | "disqualified";

export interface CreditSpreadEngineModifier {
  id: "gamma_trap" | "vol_trap" | "earnings_dte" | "inside_em_high_iv";
  label: string;
  penalty: number;
}

export interface CreditSpreadEngineResult {
  total: number;
  vol: number;
  timing: number;
  strike: number;
  rr: number;
  baseTotal: number;
  mods: CreditSpreadEngineModifier[];
  modTotal: number;
  dq: string[];
  verdict: {
    band: CreditSpreadEngineVerdictBand;
    label: string;
  };
}

export interface CreditSpreadEngineAlternative {
  title: string;
  description: string;
  params: CreditSpreadEngineParams;
  result: CreditSpreadEngineResult;
}

export type CreditSpreadEngineRiskFlagSeverity = "critical" | "danger" | "warning";

export interface CreditSpreadEngineRiskFlag {
  severity: CreditSpreadEngineRiskFlagSeverity;
  text: string;
}

const lerp = (min: number, max: number, t: number): number =>
  min + (max - min) * Math.max(0, Math.min(1, t));

export function checkDisqualifiers(params: CreditSpreadEngineParams): string[] {
  const reasons: string[] = [];
  if (params.earningsInWindow) reasons.push("Earnings announcement falls inside expiry window");
  if (params.bidAskPct > 15) reasons.push("Bid-ask spread exceeds 15% of credit (liquidity fail)");
  if (params.creditPctWidth < 15) reasons.push("Credit below 15% of wing width (minimum viability)");
  if (params.dte < 7) reasons.push("DTE below 7 (insufficient time for thesis)");
  return reasons;
}

export function scoreVolatility(ivRank: number, ivHvRatio: number): number {
  let base = 0;
  if (ivRank >= 75) base = 25;
  else if (ivRank >= 50) base = lerp(18, 25, (ivRank - 50) / 25);
  else if (ivRank >= 35) base = lerp(8, 18, (ivRank - 35) / 15);
  else base = lerp(2, 8, ivRank / 35);

  let ratio = 0;
  if (ivHvRatio >= 1.5) ratio = 8;
  else if (ivHvRatio >= 1.2) ratio = lerp(4, 8, (ivHvRatio - 1.2) / 0.3);
  else if (ivHvRatio >= 1.0) ratio = lerp(0, 4, (ivHvRatio - 1.0) / 0.2);
  else ratio = lerp(-6, 0, ivHvRatio / 1.0);

  const ivRankPenalty = ivRank < 35 ? -4 : 0;
  return Math.max(0, Math.min(25, base + ratio + ivRankPenalty));
}

export function scoreTiming(dte: number, earningsDaysAfter: number | null): number {
  let base = 0;
  if (dte >= 28 && dte <= 45) base = 25;
  else if (dte >= 21 && dte < 28) base = lerp(16, 25, (dte - 21) / 7);
  else if (dte > 45 && dte <= 60) base = lerp(14, 25, 1 - (dte - 45) / 15);
  else if (dte >= 14 && dte < 21) base = lerp(4, 16, (dte - 14) / 7);
  else if (dte >= 7 && dte < 14) base = lerp(0, 4, (dte - 7) / 7);
  else if (dte > 60) base = lerp(0, 14, 1 - (dte - 60) / 30);
  else base = 0;

  let earningsPenalty = 0;
  if (earningsDaysAfter !== null && earningsDaysAfter <= 7) {
    earningsPenalty = lerp(-10, 0, earningsDaysAfter / 7);
  }

  return Math.max(0, Math.min(25, base + earningsPenalty));
}

export function scoreStrikeQuality(
  shortDelta: number,
  creditPctWidth: number,
  outsideEM: boolean
): number {
  let base = 0;
  if (shortDelta >= 0.15 && shortDelta <= 0.22) {
    base = lerp(22, 25, 1 - Math.abs(shortDelta - 0.18) / 0.04);
  } else if (shortDelta > 0.22 && shortDelta <= 0.28) {
    base = lerp(12, 22, 1 - (shortDelta - 0.22) / 0.06);
  } else if (shortDelta > 0.28 && shortDelta <= 0.3) {
    base = lerp(4, 12, 1 - (shortDelta - 0.28) / 0.02);
  } else if (shortDelta > 0.3 && shortDelta <= 0.35) {
    base = lerp(0, 4, 1 - (shortDelta - 0.3) / 0.05);
  } else if (shortDelta > 0.35) {
    base = 0;
  } else if (shortDelta < 0.15) {
    base = lerp(4, 15, shortDelta / 0.15);
  }

  let creditBonus = 0;
  if (creditPctWidth >= 33) creditBonus = 5;
  else if (creditPctWidth >= 25) creditBonus = lerp(2, 5, (creditPctWidth - 25) / 8);
  else if (creditPctWidth >= 20) creditBonus = lerp(0, 2, (creditPctWidth - 20) / 5);
  else if (creditPctWidth >= 15) creditBonus = lerp(-3, 0, (creditPctWidth - 15) / 5);
  else creditBonus = -5;

  let emModifier = 0;
  if (outsideEM) emModifier = 4;
  else if (shortDelta > 0.25) emModifier = -6;
  else emModifier = -2;

  return Math.max(0, Math.min(30, base + creditBonus + emModifier));
}

export function scoreRiskReward(maxLossRatio: number): number {
  if (maxLossRatio <= 1.5) return 20;
  if (maxLossRatio <= 2.0) return lerp(16, 20, 1 - (maxLossRatio - 1.5) / 0.5);
  if (maxLossRatio <= 2.5) return lerp(10, 16, 1 - (maxLossRatio - 2.0) / 0.5);
  if (maxLossRatio <= 3.0) return lerp(4, 10, 1 - (maxLossRatio - 2.5) / 0.5);
  if (maxLossRatio <= 4.0) return lerp(0, 4, 1 - (maxLossRatio - 3.0) / 1.0);
  return 0;
}

export function crossCategoryModifiers(
  params: CreditSpreadEngineParams
): CreditSpreadEngineModifier[] {
  const mods: CreditSpreadEngineModifier[] = [];

  if (params.dte <= 24 && params.shortDelta > 0.25) {
    const severity = ((24 - params.dte) / 17) * ((params.shortDelta - 0.25) / 0.1);
    const penalty = Math.min(15, severity * 15);
    if (penalty > 0.5) {
      mods.push({
        id: "gamma_trap",
        label: "Short DTE with high delta — gamma exposure is elevated",
        penalty: -Math.round(penalty),
      });
    }
  }

  if (params.ivRank < 45 && params.shortDelta > 0.24) {
    const severity = ((45 - params.ivRank) / 25) * ((params.shortDelta - 0.24) / 0.1);
    const penalty = Math.min(10, severity * 10);
    if (penalty > 0.5) {
      mods.push({
        id: "vol_trap",
        label: "Aggressive strikes without volatility edge",
        penalty: -Math.round(penalty),
      });
    }
  }

  if (params.earningsDaysAfter !== null && params.earningsDaysAfter <= 5 && params.dte < 21) {
    const penalty = lerp(5, 12, 1 - params.earningsDaysAfter / 5);
    mods.push({
      id: "earnings_dte",
      label: "Earnings adjacency compounded by short DTE",
      penalty: -Math.round(penalty),
    });
  }

  if (!params.outsideEM && params.ivRank > 65) {
    const penalty = lerp(4, 10, (params.ivRank - 65) / 30);
    mods.push({
      id: "inside_em_high_iv",
      label: "Strikes inside expected move on a high-IV name",
      penalty: -Math.round(penalty),
    });
  }

  return mods;
}

export function scoreSetup(params: CreditSpreadEngineParams): CreditSpreadEngineResult {
  const dq = checkDisqualifiers(params);
  if (dq.length > 0) {
    return {
      total: 0,
      vol: 0,
      timing: 0,
      strike: 0,
      rr: 0,
      baseTotal: 0,
      mods: [],
      modTotal: 0,
      dq,
      verdict: { band: "disqualified", label: "Disqualified" },
    };
  }

  const vol = scoreVolatility(params.ivRank, params.ivHvRatio);
  const timing = scoreTiming(params.dte, params.earningsDaysAfter);
  const strike = scoreStrikeQuality(params.shortDelta, params.creditPctWidth, params.outsideEM);
  const rr = scoreRiskReward(params.maxLossRatio);
  const baseTotal = vol + timing + strike + rr;

  const mods = crossCategoryModifiers(params);
  const modTotal = mods.reduce((sum, mod) => sum + mod.penalty, 0);
  const total = Math.max(0, Math.min(100, baseTotal + modTotal));

  let band: CreditSpreadEngineVerdictBand;
  let label: string;
  if (total >= 80) {
    band = "high_conviction";
    label = "High conviction";
  } else if (total >= 65) {
    band = "good_setup";
    label = "Good setup";
  } else if (total >= 50) {
    band = "watchlist";
    label = "Watchlist";
  } else if (total >= 40) {
    band = "weak";
    label = "Weak";
  } else {
    band = "pass";
    label = "Pass";
  }

  return {
    total: Math.round(total * 10) / 10,
    vol: Math.round(vol * 10) / 10,
    timing: Math.round(timing * 10) / 10,
    strike: Math.round(strike * 10) / 10,
    rr: Math.round(rr * 10) / 10,
    baseTotal: Math.round(baseTotal * 10) / 10,
    mods,
    modTotal: Math.round(modTotal * 10) / 10,
    dq: [],
    verdict: { band, label },
  };
}

export function generateAlternatives(
  params: CreditSpreadEngineParams,
  result: CreditSpreadEngineResult
): CreditSpreadEngineAlternative[] {
  if (result.dq.length > 0) return [];

  const alts: CreditSpreadEngineAlternative[] = [];
  const cats = [
    { name: "strike", score: result.strike, max: 30 },
    { name: "timing", score: result.timing, max: 25 },
    { name: "rr", score: result.rr, max: 20 },
    { name: "vol", score: result.vol, max: 25 },
  ].sort((a, b) => a.score / a.max - b.score / b.max);

  for (const cat of cats) {
    if (alts.length >= 3) break;
    const pct = cat.score / cat.max;

    if (cat.name === "strike" && pct < 0.7) {
      if (params.shortDelta > 0.22) {
        const newParams: CreditSpreadEngineParams = {
          ...params,
          shortDelta: 0.18,
          creditPctWidth: Math.max(18, params.creditPctWidth - 6),
          outsideEM: true,
        };
        alts.push({
          title: "Widen to safer strikes",
          description: `Move short strike from ${params.shortDelta.toFixed(2)} delta to 0.18 delta. More room, less premium, likely removes cross-category penalties.`,
          params: newParams,
          result: scoreSetup(newParams),
        });
      } else if (params.shortDelta < 0.15) {
        const newParams: CreditSpreadEngineParams = {
          ...params,
          shortDelta: 0.18,
          creditPctWidth: Math.min(35, params.creditPctWidth + 8),
        };
        alts.push({
          title: "Move strikes closer for more edge",
          description: `Short strike at ${params.shortDelta.toFixed(2)} delta is very far OTM. Moving to 0.18 delta increases credit and edge.`,
          params: newParams,
          result: scoreSetup(newParams),
        });
      }
    }

    if (cat.name === "timing" && pct < 0.7) {
      if (params.dte < 25) {
        const betterDte = 35;
        const newParams: CreditSpreadEngineParams = {
          ...params,
          dte: betterDte,
          earningsDaysAfter:
            params.earningsDaysAfter !== null
              ? params.earningsDaysAfter + (betterDte - params.dte)
              : null,
        };
        alts.push({
          title: "Extend to optimal DTE",
          description: `At ${params.dte} DTE you're exposed to gamma acceleration. Moving to ~${betterDte} DTE puts you in the theta sweet spot.`,
          params: newParams,
          result: scoreSetup(newParams),
        });
      } else if (params.dte > 50) {
        const newParams: CreditSpreadEngineParams = { ...params, dte: 38 };
        alts.push({
          title: "Shorten to theta sweet spot",
          description: `At ${params.dte} DTE theta decay is slow. Moving to ~38 DTE accelerates premium collection.`,
          params: newParams,
          result: scoreSetup(newParams),
        });
      }
    }

    if (cat.name === "rr" && pct < 0.5) {
      const newParams: CreditSpreadEngineParams = {
        ...params,
        maxLossRatio: 2.0,
        creditPctWidth: Math.min(38, params.creditPctWidth + 5),
      };
      alts.push({
        title: "Narrow the wings",
        description: `Max loss at ${params.maxLossRatio.toFixed(1)}x credit is steep. Narrowing wings improves the ratio toward 2.0x.`,
        params: newParams,
        result: scoreSetup(newParams),
      });
    }

    if (cat.name === "vol" && pct < 0.5 && alts.length < 3) {
      const newParams: CreditSpreadEngineParams = {
        ...params,
        ivRank: 58,
        ivHvRatio: Math.max(params.ivHvRatio, 1.25),
      };
      alts.push({
        title: "Wait for richer volatility",
        description: `IV Rank at ${params.ivRank}% is below the sweet spot. The same structure at 58%+ scores meaningfully better.`,
        params: newParams,
        result: scoreSetup(newParams),
      });
    }
  }

  return alts;
}

export function generateRiskFlags(
  params: CreditSpreadEngineParams,
  result: CreditSpreadEngineResult
): CreditSpreadEngineRiskFlag[] {
  if (result.dq.length > 0) {
    return result.dq.map((reason) => ({ severity: "critical", text: reason }));
  }

  const flags: CreditSpreadEngineRiskFlag[] = [];

  if (result.vol / 25 < 0.4) {
    flags.push({
      severity: "warning",
      text: `IV Rank at ${params.ivRank}% is below the premium-selling sweet spot — limited volatility edge.`,
    });
  }

  if (result.timing / 25 < 0.5) {
    if (params.dte < 21) {
      flags.push({
        severity: "warning",
        text: `${params.dte} DTE puts you in the gamma acceleration zone — small moves have outsized impact.`,
      });
    }
    if (params.earningsDaysAfter !== null && params.earningsDaysAfter <= 7) {
      flags.push({
        severity: "warning",
        text: `Earnings ${params.earningsDaysAfter} day${params.earningsDaysAfter === 1 ? "" : "s"} after expiry — IV may be inflated.`,
      });
    }
  }

  if (result.strike / 30 < 0.5) {
    if (params.shortDelta > 0.28) {
      flags.push({
        severity: "danger",
        text: `Short strike delta at ${params.shortDelta.toFixed(2)} is aggressive — tight room to current price.`,
      });
    }
    if (!params.outsideEM) {
      flags.push({ severity: "warning", text: "One or both strikes sit inside the expected move." });
    }
  }

  if (result.rr / 20 < 0.3) {
    flags.push({
      severity: "warning",
      text: `Max loss is ${params.maxLossRatio.toFixed(1)}x the credit received — risk/reward is unfavorable.`,
    });
  }

  for (const mod of result.mods) {
    flags.push({ severity: "danger", text: mod.label });
  }

  const severityOrder: Record<CreditSpreadEngineRiskFlagSeverity, number> = {
    critical: 0,
    danger: 1,
    warning: 2,
  };

  return flags
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 3);
}
