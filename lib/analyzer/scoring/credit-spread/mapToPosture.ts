import type { Decision } from "@/types/analysis";
import type { CreditSpreadEngineBand } from "@/lib/analyzer/scoring/credit-spread/types";

export function mapEngineBandToDecision(band: CreditSpreadEngineBand): Decision {
  switch (band) {
    case "high_conviction":
    case "good_setup":
      return "valid";
    case "watchlist":
      return "watchlist";
    case "weak":
    case "pass":
    case "disqualified":
    default:
      return "pass";
  }
}
