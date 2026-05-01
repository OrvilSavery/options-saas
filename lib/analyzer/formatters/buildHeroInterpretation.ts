import type { ComparedSetup, Decision } from "@/types/analysis";

export function buildHumanInterpretation(
  decision: Decision,
  setup: ComparedSetup | null,
  risks: string[] = []
): string {
  const room = setup?.downsideRoom;
  const dte = setup?.daysToExpiration;
  const creditRatio =
    setup?.width && setup.premium != null && setup.width > 0
      ? setup.premium / setup.width
      : null;

  if (decision === "valid") {
    if (room != null && room >= 0.08) {
      return "There's decent room to the short strike and the risk is capped. Check the details before entry.";
    }
    if (room != null && room >= 0.05) {
      return "This looks workable. There's some room before the short strike, but it's not a huge cushion.";
    }
    return "This clears the review, but the room is still worth checking.";
  }

  if (decision === "watchlist") {
    if (room != null && room < 0.04) {
      return "Not much room to the short strike. That's the main thing holding this one back.";
    }
    if (dte != null && dte < 15) {
      return "Not much time left. Less room to manage if price moves against you.";
    }
    if (creditRatio != null && creditRatio < 0.15) {
      return "The credit is thin for the risk. That's the weak spot here.";
    }
    return "Something here isn't quite right. Probably better to watch it for now.";
  }

  // Pass
  if (room != null && room < 0.03) {
    return "The stock is right up against your short strike. Almost no room if price moves against you.";
  }

  // Room is healthy — do not blame room. Name the actual weak factor.
  if (room != null && room >= 0.08) {
    if (creditRatio != null && creditRatio < 0.15) {
      return "The credit is thin for the risk. That's the weak spot here.";
    }
    if (dte != null && dte < 15) {
      return "Not much time left. That's part of what held it back.";
    }
    if (risks.length > 0) {
      return "Room looks okay here, so that's not the main issue. Check the risk flags below for what held it back.";
    }
    return "Room looks okay here, so that's not the main issue. Something else in the review held this back.";
  }

  if (creditRatio != null && creditRatio < 0.12) {
    return "You're not collecting much for the risk. The credit doesn't justify the exposure.";
  }

  return "This one doesn't clear the review. Check the risk flags for what held it back.";
}
