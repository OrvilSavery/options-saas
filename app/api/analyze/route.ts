import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResponse } from "@/types/analysis";

const SPY_MOCK: AnalysisResponse = {
  ticker: "SPY",
  price: 542.31,
  marketCondition: "Neutral to slightly bullish with recent consolidation above support",
  volatilityCondition: "Premium environment is moderate",
  eventRisk: "low",
  decision: "valid",
  bestStrategy: {
    strategy: "Put Credit Spread",
    expiration: "2026-04-17",
    setupLabel: "SPY Apr 17 530/525 Put Credit Spread",
    premium: 1.1,
    returnOnRisk: 0.28,
    whyTopRanked:
      "This setup offers a reasonable balance of premium, downside cushion, and defined risk. It fits a neutral-to-bullish market posture without requiring aggressive directional exposure.",
  },
  saferAlternative: {
    setupLabel: "SPY Apr 17 525/520 Put Credit Spread",
    note: "Lower premium, but gives more downside room and tighter risk control.",
  },
  aggressiveAlternative: {
    setupLabel: "SPY Apr 17 535/530 Put Credit Spread",
    note: "Higher premium, but the short strike sits closer to price and carries more breach risk.",
  },
  risks: [
    "A broad market selloff could test the short strike quickly",
    "Premium is moderate, so the setup does not offer a large cushion",
    "A sharp volatility expansion could pressure the spread before expiration",
  ],
  explanation:
    "SPY shows a stable setup for a defined-risk premium-selling trade. The selected put credit spread offers a workable balance between income and downside room. It is not an aggressive setup, but it fits the current mock market posture well.",
};

function buildGenericMock(ticker: string): AnalysisResponse {
  return {
    ticker,
    price: 185.5,
    marketCondition: "Neutral and range-bound with no clear directional edge",
    volatilityCondition: "Premium environment is fair but not unusually rich",
    eventRisk: "medium",
    decision: "watchlist",
    bestStrategy: {
      strategy: "Iron Condor",
      expiration: "2026-04-17",
      setupLabel: `${ticker} Apr 17 175/170/195/200 Iron Condor`,
      premium: 1.85,
      returnOnRisk: 0.59,
      whyTopRanked:
        "This setup fits a range-bound environment and keeps risk defined on both sides while collecting premium from time decay.",
    },
    saferAlternative: {
      setupLabel: `${ticker} Apr 17 170/165 Put Credit Spread`,
      note: "Simpler defined-risk structure with less premium but easier management.",
    },
    aggressiveAlternative: {
      setupLabel: `${ticker} Apr 17 180/175 Put Credit Spread`,
      note: "Higher premium, but less downside cushion and a greater chance of being tested.",
    },
    risks: [
      "A sudden breakout could move price outside the expected range",
      "Upcoming event risk could make a neutral setup less attractive",
      "Premium is acceptable, but not high enough to justify poor execution",
    ],
    explanation:
      `${ticker} looks more like a watchlist name than a strong active setup. The iron condor fits the current mock range-bound posture, but event risk and limited edge keep it from being a stronger conviction trade.`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawTicker = body?.ticker;

    if (!rawTicker || typeof rawTicker !== "string" || rawTicker.trim() === "") {
      return NextResponse.json(
        { error: "Ticker is required" },
        { status: 400 }
      );
    }

    const ticker = rawTicker.trim().toUpperCase();

    const data: AnalysisResponse =
      ticker === "SPY" ? SPY_MOCK : buildGenericMock(ticker);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}