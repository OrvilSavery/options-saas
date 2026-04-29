import type {
  AnalysisEvidence,
  AnalysisResponse,
  LegacyStrategyEvidence,
} from "@/types/analysis";
import AnalyzerResultWorkspace from "@/components/analyzer/AnalyzerResultWorkspace";

interface AnalysisResultProps {
  data: AnalysisResponse;
}

function isGroupedEvidence(
  evidence: AnalysisResponse["evidence"]
): evidence is AnalysisEvidence {
  return Boolean(
    evidence &&
      typeof evidence === "object" &&
      ("setupContext" in evidence ||
        "executionContext" in evidence ||
        "volatilityPremiumContext" in evidence)
  );
}

function normalizeLegacyEvidence(
  evidence: LegacyStrategyEvidence | null
): AnalysisEvidence | null {
  if (!evidence) {
    return null;
  }

  return {
    setupContext: {
      shortStrike: evidence.shortStrike,
      longStrike: evidence.longStrike,
      width: evidence.width,
      daysToExpiration: evidence.daysToExpiration,
      downsideRoom: evidence.downsideRoom,
      setupSummary: null,
    },
    executionContext: {
      bidAskWidth: evidence.bidAskWidth,
      volume: evidence.volume,
      openInterest: evidence.openInterest,
      executionLabel: evidence.executionLabel,
      executionSummary: evidence.executionSummary,
    },
    volatilityPremiumContext: null,
  };
}

function getNormalizedEvidence(
  evidence: AnalysisResponse["evidence"]
): AnalysisEvidence | null {
  if (!evidence) {
    return null;
  }

  if (isGroupedEvidence(evidence)) {
    return evidence;
  }

  return normalizeLegacyEvidence(evidence);
}

export default function AnalysisResult({ data }: AnalysisResultProps) {
  const evidence = getNormalizedEvidence(data.evidence);

const analysisMode =
  data.metadata?.reviewScope?.modeLabel === "Review your setup"
    ? "review"
    : "explore";

return (
  <AnalyzerResultWorkspace
    data={data}
    evidence={evidence}
    analysisMode={analysisMode}
  />
);
}