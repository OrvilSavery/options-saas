import type { AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";
import { buildStrategyEvidence } from "@/lib/analyzer/formatters/buildStrategyEvidence";
import type {
  AnalysisEvidence,
  PremiumEnvironmentLabel,
  VolatilityContextLabel,
  VolatilityPremiumEvidence,
} from "@/types/analysis";

function normalizeVolatilityLabel(
  label: string | null | undefined
): string | null {
  if (!label) {
    return null;
  }

  return label.toString().trim().toLowerCase();
}

function derivePremiumEnvironmentLabel(
  premiumToRiskPercent: number | null
): PremiumEnvironmentLabel | null {
  if (premiumToRiskPercent == null || !Number.isFinite(premiumToRiskPercent)) {
    return null;
  }

  if (premiumToRiskPercent >= 0.2) {
    return "Supportive";
  }

  if (premiumToRiskPercent >= 0.12) {
    return "Neutral";
  }

  return "Less supportive";
}

function deriveVolatilityContextLabel(
  impliedVolatilityLabel: string | null | undefined
): VolatilityContextLabel | null {
  const normalized = normalizeVolatilityLabel(impliedVolatilityLabel);

  if (!normalized) {
    return null;
  }

  if (
    normalized.includes("high") ||
    normalized.includes("elevated") ||
    normalized.includes("rich")
  ) {
    return "Supportive";
  }

  if (
    normalized.includes("low") ||
    normalized.includes("cheap") ||
    normalized.includes("compressed")
  ) {
    return "Less favorable";
  }

  return "Neutral";
}

function buildVolatilityPremiumSummary({
  premiumEnvironmentLabel,
  volatilityContextLabel,
}: {
  premiumEnvironmentLabel: PremiumEnvironmentLabel | null;
  volatilityContextLabel: VolatilityContextLabel | null;
}): string | null {
  if (!premiumEnvironmentLabel && !volatilityContextLabel) {
    return null;
  }

  if (
    premiumEnvironmentLabel === "Supportive" &&
    volatilityContextLabel === "Supportive"
  ) {
    return "Premium conditions look supportive for a defined-risk credit structure, though richer volatility can still come with larger move risk.";
  }

  if (
    premiumEnvironmentLabel === "Less supportive" &&
    volatilityContextLabel === "Less favorable"
  ) {
    return "Premium conditions look less supportive here, so the setup may not be paying enough relative to defined risk.";
  }

  if (premiumEnvironmentLabel === "Supportive") {
    return "The credit looks reasonably supportive relative to defined risk, but the setup still needs disciplined strike placement and execution.";
  }

  if (premiumEnvironmentLabel === "Less supportive") {
    return "Credit looks lighter relative to defined risk, so the setup needs cleaner structure and context to justify entry.";
  }

  if (volatilityContextLabel === "Supportive") {
    return "Volatility conditions look supportive for premium selling, but that does not remove movement risk around the short strike.";
  }

  if (volatilityContextLabel === "Less favorable") {
    return "Volatility conditions look less favorable for premium selling, so the setup may need stronger tradeoffs elsewhere to remain attractive.";
  }

  return "Premium and volatility conditions look more neutral, so structure quality and downside room matter more here.";
}

function buildVolatilityPremiumContext({
  impliedVolatilityLabel,
  premiumToRiskPercent,
}: {
  impliedVolatilityLabel: string | null | undefined;
  premiumToRiskPercent: number | null;
}): VolatilityPremiumEvidence | null {
  const premiumEnvironmentLabel =
    derivePremiumEnvironmentLabel(premiumToRiskPercent);

  const volatilityContextLabel =
    deriveVolatilityContextLabel(impliedVolatilityLabel);

  const summary = buildVolatilityPremiumSummary({
    premiumEnvironmentLabel,
    volatilityContextLabel,
  });

  if (
    premiumEnvironmentLabel == null &&
    volatilityContextLabel == null &&
    premiumToRiskPercent == null &&
    summary == null
  ) {
    return null;
  }

  return {
    premiumEnvironmentLabel,
    volatilityContextLabel,
    premiumToRiskPercent,
    summary,
  };
}

export function buildAnalysisEvidence({
  selectedCandidate,
  underlyingPrice,
  impliedVolatilityLabel,
}: {
  selectedCandidate: AnalyzerStrategyCandidate | null;
  underlyingPrice: number;
  impliedVolatilityLabel?: string | null;
}): AnalysisEvidence | null {
  if (!selectedCandidate) {
    return null;
  }

  const { setupContext, executionContext } = buildStrategyEvidence(
    selectedCandidate,
    underlyingPrice
  );

  const volatilityPremiumContext = buildVolatilityPremiumContext({
    impliedVolatilityLabel,
    premiumToRiskPercent: selectedCandidate.returnOnRisk,
  });

  return {
    setupContext,
    executionContext,
    volatilityPremiumContext,
  };
}