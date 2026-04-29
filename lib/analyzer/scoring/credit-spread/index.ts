export { isCreditSpread } from "@/lib/analyzer/scoring/credit-spread/isCreditSpread";
export { buildEngineParams } from "@/lib/analyzer/scoring/credit-spread/buildEngineParams";
export { mapEngineBandToDecision } from "@/lib/analyzer/scoring/credit-spread/mapToPosture";
export {
  scoreSetup,
  generateAlternatives,
  generateRiskFlags,
} from "@/lib/analyzer/scoring/credit-spread/scoreSetup";
export type {
  CreditSpreadEngineParams,
  CreditSpreadEngineResult,
  CreditSpreadEngineAlternative,
  CreditSpreadEngineRiskFlag,
} from "@/lib/analyzer/scoring/credit-spread/types";
