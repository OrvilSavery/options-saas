import type { AnalyzerInput } from "@/lib/analyzer/input/types";

export function assessVolatilityCondition(input: AnalyzerInput): string {
  return input.volatilityContext.summary;
}