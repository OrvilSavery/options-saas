import type { ComparedSetup } from "@/types/analysis";
import type { AnalyzerStrategyCandidate } from "@/lib/analyzer/input/types";

export function mapEngineAlternativeRole(
  lead: AnalyzerStrategyCandidate,
  alternative: AnalyzerStrategyCandidate
): ComparedSetup["role"] {
  const leadCredit = lead.netCredit ?? lead.premium ?? 0;
  const altCredit = alternative.netCredit ?? alternative.premium ?? 0;
  const leadDelta = lead.shortDelta ?? null;
  const altDelta = alternative.shortDelta ?? null;

  if (altDelta != null && leadDelta != null && altDelta < leadDelta) {
    return "safer";
  }

  if (altCredit > leadCredit) {
    return "higher_premium";
  }

  return "safer";
}
