import type { AnalysisResponse } from "@/types/analysis";
import SummaryCard from "./SummaryCard";
import StrategyCard from "./StrategyCard";
import AlternativesCard from "./AlternativesCard";
import RiskCard from "./RiskCard";

interface AnalysisResultProps {
  data: AnalysisResponse;
}

export default function AnalysisResult({ data }: AnalysisResultProps) {
  return (
    <div className="space-y-4 mt-6">
      <SummaryCard data={data} />
      <StrategyCard bestStrategy={data.bestStrategy} />
      <AlternativesCard
        saferAlternative={data.saferAlternative}
        aggressiveAlternative={data.aggressiveAlternative}
      />
      <RiskCard risks={data.risks} explanation={data.explanation} />
    </div>
  );
}
