import type { BestStrategy, Decision, EventRisk } from "@/types/analysis";

interface BuildExplanationInput {
  ticker: string;
  marketCondition: string;
  volatilityCondition: string;
  eventRisk: EventRisk;
  decision: Decision;
  bestStrategy: BestStrategy | null;
}

function buildDecisionLead(decision: Decision): string {
  switch (decision) {
    case "valid":
      return "This reads as a usable premium-selling setup.";
    case "watchlist":
      return "This is more of a watchlist setup than a clean entry right now.";
    case "pass":
      return "This does not clear the bar for a clean premium-selling setup right now.";
  }
}

function buildEventRiskLine(eventRisk: EventRisk): string {
  switch (eventRisk) {
    case "low":
      return "No obvious near-term catalyst pressure is being inferred from the current context, but this is not a live event-calendar check.";
    case "medium":
      return "Some near-term catalyst pressure may be present, so the setup deserves more selectivity and should not be treated as automatic.";
    case "high":
      return "The current context suggests elevated catalyst pressure, so richer premium alone is not a good reason to force the trade.";
  }
}

function buildStrategyLine(bestStrategy: BestStrategy | null): string {
  if (!bestStrategy) {
    return "No candidate was strong enough to stand out as a clean current setup.";
  }

  const premiumText =
    bestStrategy.premium != null
      ? `The leading candidate is ${bestStrategy.setupLabel}, collecting about $${bestStrategy.premium.toFixed(
          2
        )} in premium.`
      : `The leading candidate is ${bestStrategy.setupLabel}.`;

  return `${premiumText} ${bestStrategy.whyTopRanked}`;
}

export function buildExplanation(input: BuildExplanationInput): string {
  const marketCondition = (input.marketCondition ?? "mixed").toLowerCase();
  const volatilityCondition = (
    input.volatilityCondition ?? "workable but incomplete"
  ).toLowerCase();

  return [
    buildDecisionLead(input.decision),
    `${input.ticker} currently looks ${marketCondition}.`,
    `Volatility backdrop is ${volatilityCondition}.`,
    buildEventRiskLine(input.eventRisk),
    buildStrategyLine(input.bestStrategy),
  ].join(" ");
}