import type { ComparedSetup } from "@/types/analysis";

interface BuildTrackedSetupKeyInput {
  ticker: string;
  strategy?: string | null;
  expiration?: string | null;
  shortStrike?: number | null;
  longStrike?: number | null;
}

function normalizePart(value: string | number | null | undefined): string {
  if (value == null) return "none";
  return (
    String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "none"
  );
}

export function buildTrackedSetupKey(input: BuildTrackedSetupKeyInput): string;
export function buildTrackedSetupKey(ticker: string, setup?: ComparedSetup | null): string;
export function buildTrackedSetupKey(
  inputOrTicker: BuildTrackedSetupKeyInput | string,
  setup?: ComparedSetup | null
): string {
  const input: BuildTrackedSetupKeyInput =
    typeof inputOrTicker === "string"
      ? {
          ticker: inputOrTicker,
          strategy: setup?.strategy ?? null,
          expiration: setup?.expiration ?? null,
          shortStrike: setup?.shortStrike ?? null,
          longStrike: setup?.longStrike ?? null,
        }
      : inputOrTicker;

  return [
    normalizePart(input.ticker),
    normalizePart(input.strategy),
    normalizePart(input.expiration),
    normalizePart(input.shortStrike),
    normalizePart(input.longStrike),
  ].join("::");
}
