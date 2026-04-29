import type { AnalyzerInput } from "@/lib/analyzer/input/types";

export function assessMarketCondition(input: AnalyzerInput): string {
  return input.marketContext.summary;
}