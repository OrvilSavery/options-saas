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

export type CreditSpreadEngineBand =
  | "high_conviction"
  | "good_setup"
  | "watchlist"
  | "weak"
  | "pass"
  | "disqualified";

export interface CreditSpreadEngineModifier {
  id: string;
  label: string;
  penalty: number;
}

export interface CreditSpreadEngineRiskFlag {
  severity: "critical" | "danger" | "warning";
  text: string;
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
    band: CreditSpreadEngineBand;
    label: string;
  };
}

export interface CreditSpreadEngineAlternative {
  title: string;
  description: string;
  params: CreditSpreadEngineParams;
  result: CreditSpreadEngineResult;
}
